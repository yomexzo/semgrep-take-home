# Yomi's Semgrep take home

## Dependencies/Prerequisites
- NodeJS. This was implemented in node version v19.9.0
- Semgrep. Follow the instructions on [Semgrep's website](https://semgrep.dev/docs/getting-started/) for your specific environment to install semgrep. This repo will assume that it is set up already. This was tested with Semgrep version - 1.39.0

## FYI
- If path `git clone` writes to exists already, we first delete. So one can say, an existing/cloned repo is overwritten.

## Thought dump while working on the assignment
I have decided to detail my reasoning process here in the README as I solve the two take home problems. Some of these will come across as raw thoughts - bear with me.

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