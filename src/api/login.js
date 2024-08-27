const loginBase=`https://www.imgkits.com`


export function loginGoogle(token,googleUid){
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Access-Channel': 'ai_baby_generator',
  };

  return useHttp.post(loginBase+'/api/user/union-login', { token,google_uid }, headers);
}