// const longPollingData = async (fetch, stop) => {
//   let response = await fetch();

//   if (stop(response)) return response;

//   await new Promise((resolve) => setTimeout(resolve, 1000));
//   return await longPollingData(fetch, stop);
// };

// const asyncData = (map) => (x) => {
//   return x.then((data) => map(data));
// };

// const when = (f) => (map) => (x) => {
//   if (f(x)) return map(x);

//   return x;
// };

// class Container {
//   constructor(x) {
//     this.x = x;
//   }

//   map(f) {
//     return Container.from(f(this.x));
//   }
//   get() {
//     return this.x;
//   }
//   static from(x) {
//     return new Container(x);
//   }
// }
// module.exports = {
//   longPollingData,
//   when,
//   Container,
//   asyncData,
// };
