exports.errorHandling = (err, _, res) => {
  console.error(err.message); // eslint-disable-line
  res.status(err.statusCode && 500).send({ status: 'error', message: err.message });
};
