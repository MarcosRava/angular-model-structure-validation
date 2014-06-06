angular.module('modelStructure', [])
.directive('modelStructureValidation', [function() {
  return {
    restrict: 'A',
    require: '^form',
    link: function ($scope, element, attrs, $form) {
      $scope.$modelValidation.$showErrors = $scope.$modelValidation.$showErrors || showErrors;
      function showErrors(errs, elements, $modelController, attr) {
        console.log(errs, elements, $modelController, attr);
      }
      $scope.$modelValidation.$submit = function ($event) {
        for(var e in $scope.$modelValidation.$errors) {
          for (var ae in  $scope.$modelValidation.$errors[e]) {
            var obj = $scope.$modelValidation.$errors[e][ae];
            if (obj.err) {
              $scope.$modelValidation.$showErrors(obj.err, obj.elements, obj.$ctrl, obj.attr);
            }

          }
        }
        if ($form.$valid)
          $scope.$eval($scope.$modelValidation.$posSubmit);
      };
      $scope.$modelValidation.$errors = $scope.$modelValidation.$errors || [];
      var elsAttr = {};
      $scope.$modelValidation.$errors.push(elsAttr);
      var model = $scope.$eval(attrs.modelStructureValidation);
      if (!model || model.constructor.prototype._super !== Model) {
        throw new Error("Is not a Model object!");
      }
      var modelAttrs = Object.keys(model.access('schema'));
      for (var attrI in modelAttrs) {
        var attr =  modelAttrs[attrI];
        var attrEls = [].slice.call(element[0].querySelectorAll('[ng-model="' + attrs.modelStructureValidation + '.' + attr + '"]'));
        if (attrEls.length === 0)
          attrEls = attrEls.concat([].slice.call(element[0].querySelectorAll('[data-ng-model="' + attrs.modelStructureValidation + '.' + attr + '"]')));
        for (var n in attrEls) {
          attrEls[n] = angular.element(attrEls[n]);
          if (!attrEls[n].attr('name'))
            throw new Error("element must have name attribute");
        }
        if(attrEls && attrEls.length > 0) {
          elsAttr[attr] = {elements: attrEls, attr: attr, $ctrl: $form[attrEls[n].attr('name')]};
          $scope.$watch(attrs.modelStructureValidation + '.' + attr, isValid);
        }
      }
      function isValid() {
        model = $scope.$eval(attrs.modelStructureValidation);
        var a;
        for(var m in modelAttrs) {
          a = modelAttrs[m];
          if (!elsAttr[a]) continue;
          elsAttr[a].$ctrl.$setValidity(a, true);
          delete elsAttr[a].err;
        }
        model.isValid(function(err) {
          if (!err) return;
          var keys = Object.keys(err);
          for(var k in keys) {
            a = keys[k];
            if (!elsAttr[a]) continue;
            var el = elsAttr[a].elements;
            elsAttr[a].$ctrl.$setValidity(a, false);
            elsAttr[a].err = err[a];
          }
          return err;
        });
      }
    }
  };
}])
.directive('modelValidation', ['$compile', function($compile) {
  return {
    restrict: 'A',
    replace: false,
    terminal: true,
    priority: 1000,
    compile: function compile(element, attrs) {
      var sub ='$modelValidation.$submit($event)';
      element.removeAttr('ng-submit');
      element.attr('data-ng-submit', sub);
      return {
        pre: function preLink($scope, element, attrs, controller) {
          $scope.$modelValidation = $scope.$modelValidation || {};
          $scope.$modelValidation.$posSubmit = attrs.ngSubmit || (function(){})();
          element.attr('model-structure-validation', attrs.modelValidation);
          element.removeAttr("document-number-mask"); // avoid compile loop.
          element.removeAttr("model-validation"); // avoid compile loop.
          element.removeAttr("data-model-validation"); // avoid compile loop.
        },
        post: function postLink($scope, element, attrs, controller) {
          $compile(element)($scope);
        }
      };
    }
  };
}])
.directive('modelShowErrors', function() {
  return {
    restrict: 'A',
    link: function ($scope, element, attrs) {
      $scope.$modelValidation = $scope.$modelValidation || {};
      $scope.$modelValidation.$showErrors = $scope.$eval(attrs.modelShowErrors);
    }
  };
})
;
