import soap from 'soap';
var url = 'http://localhost:8000/wsdl?wsdl';
var args = {name: 'value'};

soap.createClient(url, function(err, client) {
  if(err) {
    console.log(err)
  }
  //client.MyService.MyPort.MyAsyncFunction(args, function(err, result) {
  //  if(err) {
  //    console.log("err: ", err);
  //  }
  //  else {
  //    console.log(result);
  //  }
  //});
  console.log(client.MyService.MyPort.GetAll(args, (err, res) => {
    if(err) {
      console.error(err);
    } else {
      console.log("ok");
    }
  }));
});
