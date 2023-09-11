export default (q, limit) => {
  let page = 1;
  const per_page = limit <= 100 ? limit : 100;
  const searchPromises = [];

  do {
    const url = `https://api.github.com/search/repositories?q=${q}&per_page=${per_page}&page=${page}`;
    searchPromises.push(
      fetch(url).then((response) => {
        return response.json();
      }).then(({items}) => {
        return items.map(({name, ssh_url, full_name}) => ({name, ssh_url, full_name}));
      })
    );
      
      page++;
  } while(limit > page * per_page);

  return Promise.all(searchPromises).then(result => result.flat());
}