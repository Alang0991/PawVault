const fs = require('fs');
const path = require('path');
const axe = require('axe-core');
const { JSDOM } = require('jsdom');

const buildDir = path.join(__dirname, '..', 'out');
const pagesDir = path.join(__dirname, '..', '.next', 'server', 'app');

if (!fs.existsSync(buildDir) && !fs.existsSync(pagesDir)) {
  console.log('Build output not found. Run `npm run build` first.');
  process.exit(1);
}

function getHtmlFiles(dir) {
  const files = [];
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.html')) {
        files.push(full);
      }
    }
  }
  if (fs.existsSync(dir)) walk(dir);
  return files;
}

async function auditFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(html, {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable',
  });

  const window = dom.window;
  const document = window.document;

  try {
    const results = await axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
      },
      rules: {
        'color-contrast': { enabled: true },
        'keyboard': { enabled: true },
        'focus-visible': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'image-alt': { enabled: true },
        'label': { enabled: true },
        'button-name': { enabled: true },
        'link-name': { enabled: true },
        'heading-order': { enabled: true },
        'landmark-one-main': { enabled: true },
        'region': { enabled: true },
        'skip-link': { enabled: true },
      },
    });

    return {
      file: path.relative(buildDir || pagesDir, filePath),
      violations: results.violations,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
    };
  } catch (e) {
    return {
      file: path.relative(buildDir || pagesDir, filePath),
      error: e.message,
    };
  }
}

async function main() {
  console.log('Running accessibility audit...\n');

  const htmlFiles = getHtmlFiles(buildDir || pagesDir);
  console.log(`Found ${htmlFiles.length} HTML files to audit\n`);

  const allResults = [];
  let totalViolations = 0;
  let totalCritical = 0;
  let totalSerious = 0;
  let totalModerate = 0;
  let totalMinor = 0;

  for (const file of htmlFiles.slice(0, 20)) {
    const result = await auditFile(file);
    allResults.push(result);

    if (result.violations) {
      for (const v of result.violations) {
        totalViolations++;
        switch (v.impact) {
          case 'critical': totalCritical += v.nodes.length; break;
          case 'serious': totalSerious += v.nodes.length; break;
          case 'moderate': totalModerate += v.nodes.length; break;
          case 'minor': totalMinor += v.nodes.length; break;
        }
      }
    }

    const status = result.error ? 'ERROR' : result.violations.length === 0 ? 'PASS' : 'FAIL';
    console.log(`[${status}] ${result.file} - ${result.violations?.length || 0} violations`);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Pages audited: ${allResults.length}`);
  console.log(`Total violations: ${totalViolations}`);
  console.log(`  Critical: ${totalCritical}`);
  console.log(`  Serious: ${totalSerious}`);
  console.log(`  Moderate: ${totalModerate}`);
  console.log(`  Minor: ${totalMinor}`);

  if (totalViolations > 0) {
    console.log('\n=== VIOLATIONS BY TYPE ===');
    const violationMap = {};
    for (const result of allResults) {
      if (result.violations) {
        for (const v of result.violations) {
          if (!violationMap[v.id]) {
            violationMap[v.id] = { count: 0, impact: v.impact, description: v.description, help: v.helpUrl };
          }
          violationMap[v.id].count += v.nodes.length;
        }
      }
    }

    for (const [id, data] of Object.entries(violationMap).sort((a, b) => b[1].count - a[1].count)) {
      console.log(`  ${id} (${data.impact}): ${data.count} occurrences`);
      console.log(`    ${data.description}`);
      console.log(`    ${data.help}`);
    }
  }

  if (totalCritical > 0 || totalSerious > 0) {
    console.log('\n❌ ACCESSIBILITY AUDIT FAILED - Critical/Serious violations found');
    process.exit(1);
  } else if (totalViolations > 0) {
    console.log('\n⚠️  ACCESSIBILITY AUDIT PASSED WITH WARNINGS - Minor/Moderate violations found');
  } else {
    console.log('\n✅ ACCESSIBILITY AUDIT PASSED - No violations found');
  }
}

main().catch(console.error);