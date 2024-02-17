export function resJSON({
  statusCode = 200,
  message = null,
  data = null,
  ...props
}) {
  const resData = { status: statusCode, message, data, ...props };

  return resData;
}
