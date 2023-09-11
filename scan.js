#!/usr/bin/env node

const getUrl = (q, page, per_page) => {
    return `https://api.github.com/search/repositories?q=${q}&per_page=${per_page}&page=${page}`;
}

const requested = 50;
const page = 1;
const per_page = requested <= 100 ? requested : 100;
const q = 'yomi';

const url = getUrl(q, page, per_page);
fetch(url).then((response) => {
    return response.json();
}).then(({items, total_count, incomplete_results}) => {
  const repos = items.map(({name, full_name, ssh_url}) => {
    return {name, full_name, ssh_url};
  });
  
  console.log(repos)
});