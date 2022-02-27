#!/bin/env sh
curl --header "Content-Type: text/xml;charset=UTF-8" --header "SOAPAction: VehicleService.Hello" --data @base.xml 127.0.0.1:8001/wsdl
