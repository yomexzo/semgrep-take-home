# Yomi's Semgrep take home

## Usage
- Clone repo.
- Run scanner using `❯ ./scan.js "goat security"`.
  ```
  $ ./scan.js  "add-github-search-query-here"
  20              \ # Number of repos to download
  /tmp/repos        # Where to store the downloaded repos`);
   ``` 

## :exclamation: Note/Caveat: 
- The problem statement asked that repos are cloned into directories named as the name of the repo. For example "**script should download OWASP/NodeGoat to /tmp/repos/NodeGoat, OWASP/Serverless-Goat to /tmp/repos/Serverless-Goat, etc.**". This quickly breaks if repos with the same name but different owners come up in the search result. I experienced this when I used the `goat security` search parameter asking for `50` repos. `sonatype-workshops/NodeGoat.git` and `OWASP/NodeGoat.git` appeared in the search result.

  So I decided to use the full name instead.. That is **script downloads OWASP/NodeGoat to /tmp/repos/OWASP/NodeGoat, OWASP/Serverless-Goat to /tmp/repos/OWASP/Serverless-Goat, etc.**"

- When cloning, if folder exists already, I delete it first before cloning. So one can say that whatever is in the path a repo is being cloned into is overwritten. This becomes safer since the "owner" is now used in the path name.

## Dependencies/Prerequisites
- NodeJS. This was implemented in node version v19.9.0
- Semgrep. Follow the instructions on [Semgrep's website](https://semgrep.dev/docs/getting-started/) for your specific environment to install semgrep. This repo will assume that it is set up already. This was tested with Semgrep version - 1.39.0


## Thought dump while working on the assignment
I have decided to detail my reasoning process here in the README as I solve the take home problems. Some of these will come across as raw thoughts - bear with me.

After reading Part 1 of the assignment, my brain decided to choose Javascript/NodeJS as the technology choice/stack. Primarily for two reasons
1. Although I am fluent in other languages, it is the language I will be most comfortable in right now
2. I'm fairly certain there will be wrapper libraries around Github APIs and Semgrep.

While trying to validate (2). I pivoted and used alternative approaches.
- After some googling, I found github-tools/github. But then realized all I really need is one API. The search API. So I decided to hard code the API URI
- For cloning the repo, I wanted to use "nodegit" npm library because I had used it in the past. But quickly ran into environment issues that made me give up on this eventually. I ended up using the `exec` function

What this means is that for searching the Github API and and cloning the repos in the result, I did not need any external nodejs dependencies. While implementing this, I handled a couple of data validations and checks
- ensuring that input provided for number of repos is numeric
- ensuring that path provided does not exists and if it exists, must be a directory. Since we will be downloading things in there.

Time to figure out how to use semgrep. Figured installation was easy! Semgrep's docs site to the rescue! Time to figure out how to perform the scan.

Once implementation was completed. I decided to test. Oh my, I was close to tearing out all of my hair wondering why semgrep wasn't returning any findings. Turned out it was skipping all files because I used "test" as my directory. Which is part of `.semgrepignore` defaults. JUST, WOW! Once I changed the directory name, I was able to validate things.

I had some logs showing status of the script (what it is doing). But, I commented that out since there is an expected output and just in case the output is consumed by an automated script.

I did not spend too much time on bugs / potential vulns. For example, I ran `semgrep` against this repo and it turned up with a finding. 