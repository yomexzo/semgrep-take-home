#!/usr/bin/env node

import readline from 'readline';
import { exec } from 'child_process';
import fs from 'fs';

// I need this to be able to read user input. Per requirement, number of repos is requested on a separate line. Hence this.
const getUserInput = () => {
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

const getUrl = (q, page, per_page) => {
    return `https://api.github.com/search/repositories?q=${q}&per_page=${per_page}&page=${page}`;
}

const printUsage = () => {
  console.log(`\n
  USAGE:

  $ <program> ["goat security"](https://r2c.dev/) \ # GitHub search query

  20              \ # Number of repos to download
  
  /tmp/repos        # Where to store the downloaded repos`);
};

const q = process.argv[2] || '';
if (q.trim().length === 0) {
  console.error("\nA search term is expected to determine which repos to clone and scan");
  printUsage();
  process.exit(1);
}

const requested_repo_count = await getUserInput();
if (isNaN(requested_repo_count)) {
  console.error("\nA number is expected to determine number of repos to clone and scan");
  printUsage();
  process.exit(1);
}

let directory_path = await getUserInput();
const directory_path_exists = fs.existsSync(directory_path);
const is_directory = directory_path_exists && fs.lstatSync(directory_path).isDirectory();

if (directory_path_exists && !is_directory) {
  console.error("\nPath provided must either not exist or be a directory if it does");
  printUsage();
  process.exit(1);
}
if (!directory_path.length) {
  console.error("\nA directory where the repos will be downloaded to is expected");
  printUsage();
  process.exit(1);
}

console.log();




let page = 1;
const per_page = requested_repo_count <= 100 ? requested_repo_count : 100;
const searchPromises = [];

const clone_repo = (url, directory_path, name, full_name) => {
  return new Promise((resolve, reject) => {
    // console.log(`Cloning ${url}`);

    const path = `${directory_path}/${full_name}`;

    if (fs.existsSync(path)) {
      fs.rmSync(path, { recursive: true });
    }

    exec(`git clone --depth 1 ${url} ${path}`, (error, stdout, stderr) => {
      if (error) {
        console.warn(`${url} ${error}`);
        reject(error);
        return;
      }
      resolve({
        url,
        name,
        full_name,
        directory_path,
        path,
      });
    });
  });
}

do {
  const url = getUrl(q, page, per_page);
  searchPromises.push(
    fetch(url).then((response) => {
      return response.json();
    }).then(({items}) => {
      const repos = items.map(({name, ssh_url, full_name}) => {
        return clone_repo(ssh_url, directory_path, name, full_name);
      });
      return Promise.all(repos);
    })
  );

  page++;
} while(requested_repo_count > page * per_page);

// I want to run semgrep --version to test and ensure that semgrep is installed and available
const semgrep_version = await new Promise((resolve, reject) => {
  exec(`semgrep --version`, (error, stdout, stderr) => {
    if (error) {
      console.error(`It appears semgrep is not installed on your machine. Follow instructions at https://semgrep.dev/docs/getting-started/ to install semgrep`);
      console.error(`\n${error}`);
      process.exit(1);

    }
    resolve(stdout);
  });
});

const scan_repo = ({url, path, directory_path, name, full_name}) => {
  return new Promise((resolve, reject) => {
    // console.log(`Scanning ${url}`);

    const semgrep_output_path = `${path}/semgrep_output.json`;
    exec(`semgrep --config "p/r2c-security-audit" ${path} --json > ${path}/semgrep_output.json`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error encountered scanning ${path}`);
        console.error(`\n${error}`);
        reject(error); 

        return;
      }

      const semgrep_output = JSON.parse(fs.readFileSync(semgrep_output_path, 'utf8'));

      resolve({
        path,
        directory_path,
        name,
        full_name,
        semgrep_output_path,
        semgrep_output,
        semgrep_outputx: JSON.stringify(semgrep_output, null, 2),
      });
    });
  });
}

Promise.all(searchPromises).then((repos) => {
  return Promise.all(
    repos.flat().map((repo) => scan_repo({url: repo.url, path: repo.path, directory_path: repo.directory_path, name: repo.name, full_name: repo.full_name}))
  );
}).then((repos) => {
  const triggered_rules = repos.map(({semgrep_output}) => {
    return semgrep_output.results.map(({check_id}) => check_id);
  }).flat().reduce((acc, check_id) => {
    acc[check_id] = (acc[check_id] || 0) + 1;
    return acc;
  }, {});
  
  
  Object.entries(triggered_rules).sort((a, b) => b[1] - a[1]).map(([check_id, count]) => {
    console.log(`${check_id}: ${count}`);
  });
});


