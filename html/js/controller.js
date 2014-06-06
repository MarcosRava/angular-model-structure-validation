var app = angular.module('app', ['modelStructure']);
app.controller('ctrl', ["$scope", function($scope) {

  $scope.submit = function() {
    console.log($scope.$modelValidation);
  };
  var Customer = (function (_super) {
    function Customer(args) {
      _super._init_(this, args);
    }
    Customer.schema = {
      messages: {
        integer: "Generic validation message"
      },
      properties: {
        id : {
          type: 'integer',
          required: true,
          primaryKey: true,
          autoIncrement: true
        },
        name : {
          type: 'string',
          length: {
            minimum: 3,
            maximum: 30
          }
        },
        email : {
          type: 'email',
          message: 'is not a valid email!!',
          length: {
            minimum: 7,
            tooShort: "Short email (custom attribute message)"
          }
        },
        age : {
          type: 'integer'
        },
        hands : {
          type: 'integer'
        }
      }
    };
    return Customer;
  })(Model);
  var model = {name: "Marcos"};
  model.email = 'marcos*gmail.com';
  model.age = '1w1';
  $scope.model = new Customer(model);
}]);
