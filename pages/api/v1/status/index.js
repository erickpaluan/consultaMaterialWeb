function status(request, response) {
  response.status(200).json({ status: "tudo funcionando." });
}

export default status;
