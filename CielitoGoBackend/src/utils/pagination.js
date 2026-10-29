const getPagination = (query, defaultLimit = 20) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || defaultLimit;
  return { page, limit, offset: (page - 1) * limit };
};

const paginationResponse = (count, page, limit) => ({
  total: count,
  page,
  limit,
  pages: Math.ceil(count / limit),
});

module.exports = { getPagination, paginationResponse };
