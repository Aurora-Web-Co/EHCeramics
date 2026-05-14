const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(prompt) {
    return new Promise(resolve => rl.question(prompt, resolve));
}

function slugify(str) {
    return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
    const title = (await ask("Page title: ")).trim();
    if (!title) {
        console.error("Error: Page title is required.");
        rl.close();
        process.exit(1);
    }

    const rawSlug = (await ask(`Slug [${slugify(title)}]: `)).trim();
    const slug = rawSlug ? slugify(rawSlug) : slugify(title);
    rl.close();

    const htmlPath = path.join("src", `${slug}.html`);
    const scssPath = path.join("src", "assets", "sass", `${slug}.scss`);

    if (fs.existsSync(htmlPath)) {
        console.error(`Error: ${htmlPath} already exists.`);
        process.exit(1);
    }
    if (fs.existsSync(scssPath)) {
        console.error(`Error: ${scssPath} already exists.`);
        process.exit(1);
    }

    fs.writeFileSync(
        htmlPath,
        `---
title: "${title}"
description: ""
permalink: "/${slug}/"
tags: "sitemap"
---

{% extends "layouts/base.html" %}

{% block head %}
<link rel="stylesheet" href="/assets/css/${slug}.css" />
{% endblock %}

{% block body %}

<!-- Add page sections here -->

{% endblock %}
`
    );

    fs.writeFileSync(scssPath, `/* ${title} Page Styles */\n`);

    console.log(`\nCreated:`);
    console.log(`  ${htmlPath}`);
    console.log(`  ${scssPath}`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
