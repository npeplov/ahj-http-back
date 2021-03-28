const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();

class Ticket {
  constructor(id, name, status, created) {
    this.id = id // идентификатор (уникальный в пределах системы)
    this.name = name // краткое описание
    this.status = status // boolean - сделано или нет
    this.created = created // дата создания (timestamp)
  }
}

class TicketFull {
  constructor(id, name, description, status, created) {
    this.id = id // идентификатор (уникальный в пределах системы)
    this.name = name // краткое описание
    this.description = description // полное описание
    this.status = status // boolean - сделано или нет
    this.created = created // дата создания (timestamp)
  }
}

const tickets = [
  new Ticket(1, 'Install Win', false, new Date()),
  new Ticket(2, 'Replace cartridge', true, new Date())
];

const ticketsFull = [
  new TicketFull(1, 'Install Win', 'Install Windows 10, drivers for printer, MS Office, save documents and mediafiles', false, new Date()),
  new TicketFull(2, 'Replace cartridge', 'Replace cartridge for printer Samsung in cabinet #404', true, new Date())
];

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  console.log('origin:', origin);
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
  const obj = { method: params.get('method'), id: params.get('id') };
  const { method} = obj;
  const id = obj.id - 1;

  console.log('method:', method, 'id:', id);
  // console.log(ticketsFull[id]);

  switch (method) {
    case 'allTickets':
      ctx.response.body = tickets;
      return;
    case 'ticketById':
      ctx.response.body = ticketsFull[id];
      return;
    default:
        ctx.response.status = 404;
        return;
}
  ctx.response.body = method;
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
