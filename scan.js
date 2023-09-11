#!/usr/bin/env node


import fs from 'fs';
import clone_repo from './clone_repo.js';
import scan_repo from './scan_repo.js';
import take_input from './take_input.js';
import search_github from './search_github.js';
import ensure_semgrep_is_installed from './semgrep_version.js';
import print_usage from './print_usage.js';

await ensure_semgrep_is_installed(); // This automatically quits the program if semgrep is not installed

const q = process.argv[2] || '';
if (q.trim().length === 0) {
  console.error("\nA search term is expected to determine which repos to clone and scan");
  print_usage();
  process.exit(1);
}

const requested_repo_count = await take_input();
if (isNaN(requested_repo_count)) {
  console.error("\nA number is expected to determine number of repos to clone and scan");
  print_usage();
  process.exit(1);
}

let directory_path = await take_input();
const directory_path_exists = fs.existsSync(directory_path);
const is_directory = directory_path_exists && fs.lstatSync(directory_path).isDirectory();

if (directory_path_exists && !is_directory) {
  console.error("\nPath provided must either not exist or be a directory if it does");
  print_usage();
  process.exit(1);
}
if (!directory_path.length) {
  console.error("\nA directory where the repos will be downloaded to is expected");
  print_usage();
  process.exit(1);
}

const repos = await search_github(q, requested_repo_count);
const cloned_repos = await Promise.all(repos.map(({ssh_url, name, full_name}) => clone_repo(ssh_url, directory_path, name, full_name)));
const scanned_repos = await Promise.all(cloned_repos.map(({url, path, directory_path, name, full_name}) => scan_repo(url, path, directory_path, name, full_name)));

const triggered_rules = scanned_repos
  .map(({semgrep_output}) => semgrep_output.results.map(({check_id}) => check_id))
  .flat()
  .reduce((acc, check_id) => {
    acc[check_id] = (acc[check_id] || 0) + 1;
    return acc;
  }, {});

Object.entries(triggered_rules)
  .sort((a, b) => b[0] - a[0]) // sort by name first. So IDs with same count will be sorted by name
  .sort((a, b) => b[1] - a[1]) // sort by count
  .map(([check_id, count]) => {
    console.log(`${check_id}: ${count}`);
  });
