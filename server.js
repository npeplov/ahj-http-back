const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  console.log(origin);
  if (!origin) {
    return await next();
  }
  const headers = { 'Access-Control-Allow-Origin': '*', };
  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({...headers});
    try {
      return await next();
    } catch (e) {
      e.headers = {...e.headers, ...headers};
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });
    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }
    ctx.response.status = 204;
  }
});

app.use(koaBody({
  urlencoded: true,
}));

const subscriptions = new Map();
app.use(async ctx => {
  const params = new URLSearchParams(ctx.request.querystring);
  const obj = { name: params.get('name'), phone: params.get('phone') };
  
  const { name, phone } = obj;
  // const { name, phone } = ctx.request.body;  // for POST
  console.log(name, phone);

  if (subscriptions.has(phone)) {
    ctx.response.status = 400
    ctx.response.body = 'You already subscribed';
    return;
  }

  subscriptions.set(phone, name);
  ctx.response.body = 'Ok';
});

app.use(async (ctx) => {
  // ctx.response.set({
  //   'Access-Control-Allow-Origin': '*',
  // });
  console.log('request.querystring:', ctx.request.querystring);
  console.log('request.body', ctx.request.body);
  ctx.response.status = 204;
  // ctx.response.body = ctx.response.status;

  console.log(ctx.response);
});

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);
