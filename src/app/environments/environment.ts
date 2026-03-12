export const environment = {
  production: false,
  ApiUrl: 'https://localhost:7184/api/',
  LogoutUrl: '/',
};

export const URI_ENDPOINT = (term: string) => `${environment.ApiUrl}${term}`;
export const URI_ENDPOINT_WITH_ID = (term: string, id: any) =>
  `${environment.ApiUrl}${term}/${id}`;

export const URI_ENDPOINT_WITH_PARAMS = (serviceName: string, params: any[]) =>
  `${environment.ApiUrl}${serviceName}/${parseParamsToUrlEncode(params).join(
    '/'
  )}`;
function parseParamsToUrlEncode(params: any[]): any[] {
  var returnValue: any[] = [];
  params.forEach((param) => returnValue.push(encodeURIComponent(param)));
  return returnValue;
}
