import soap from 'soap'
import fs from 'fs';
import cars from './cars.json';


const getAll_Service = {
  GetAll_Service: {
    Port: {
      GetAll: function() {
        return JSON.string(cars);
      },
    }
  }
};

export default {
  getAll_Service
}
