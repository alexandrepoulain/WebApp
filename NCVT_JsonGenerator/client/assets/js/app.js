(function() {
  'use strict';

  angular.module('application', [
    'ui.router',
    'ngAnimate',
    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
  ])
    // service to share the id 
    .service('sharedId', function () {
        var property = "";
        return {
            getProperty: function () {
                return property;
            },
            setProperty: function(value) {
                property = value;
            }
        };
    })

    // control settings ProcessingBlock
    .controller('CtrlSettingProcessBlock', function($scope, sharedId) {

        var id = sharedId.getProperty();
        $scope.master = {Name: "ProcessingBlock", ID: id, nameScript: "", interpreter: "", selection: "", inputs: [], outputs: [], parameters: []};
        // add inputs
        $scope.addInputs = function (key,value) {
          var temp = {key,value};
          $scope.sequence.inputs.push(temp);
          $scope.saveProcessBlock();
        };
        // add outputs
        $scope.addOutputs = function (key,value) {
          var temp = {key,value};
          $scope.sequence.outputs.push(temp);
          $scope.saveProcessBlock();
        };
        // add element in list parameters
        $scope.addParameter = function (key,value) {
          var temp = {key,value};
          $scope.sequence.parameters.push(temp);
          $scope.saveProcessBlock();
        };
        // reset block
        $scope.reset = function() {
            $scope.sequence = angular.copy($scope.master);
        };
        $scope.reset();
        // store the block in local
        $scope.saveProcessBlock = function () {
          
          localStorage.setItem($scope.sequence.ID, JSON.stringify($scope.sequence));
        };
        // get the block by id
        $scope.uploadData = function (id) {
          // Ici, on reconvertit la chaîne en un objet 
          // JSON.stringify and saved in localStorage in JSON object again
          var sessionRestaurée = JSON.parse(localStorage.getItem(id));
          try {
            if (sessionRestaurée.ID != null)
              $scope.sequence = sessionRestaurée;
          } catch(e) {
            // statements
            console.log("Pas d'id pour session");
          }
          
          // La variable sessionRestaurée contient désormais l'objet précédent
          // qui avait été sauvegardé dans localStorage
          console.log(sessionRestaurée);
        };
    })

    // control settings ProcessingSequence
    .controller('CtrlSettingProcessSeq',function($scope, $http, sharedId) {
        var id = sharedId.getProperty();
        $scope.master = {Name: "Sequence" , ID: id};
        $scope.reset = function() {
            $scope.sequence = angular.copy($scope.master);
        };
        $scope.reset();

        $scope.saveSeqBlock = function () {
          
          localStorage.setItem($scope.sequence.ID, JSON.stringify($scope.sequence));
        };

        $scope.uploadData = function (id) {
          // Ici, on reconvertit la chaîne en un objet 
          // JSON.stringify and saved in localStorage in JSON object again
          var sessionRestaurée = JSON.parse(localStorage.getItem(id));
           try {
            if (sessionRestaurée.ID != null)
              $scope.sequence = sessionRestaurée;
          } catch(e) {
            // statements
            console.log("Pas d'id pour session");
          }
          
          // La variable sessionRestaurée contient désormais l'objet précédent
          // qui avait été sauvegardé dans localStorage
          console.log(sessionRestaurée);
        };
        

    })

    // control settings CrossValidationBlock
    .controller('CtrlSettingCrossBlock', function($scope, sharedId) {
        var id = sharedId.getProperty();
        $scope.master = {Name: "CrossValidationBlock", ID: id, "CrossValidationType": ""};
        
        $scope.chooseTypeCV = function(type) {
          // in function on the type we give the parameters
          $scope.sequence["CrossValidationType"] = type ;
          if(type == 'k-fold' || type == 'bootstrapping'){
            $scope.sequence.parameters = { "CrossValidationCount" : "", 
                                          "CrossValidationOutput" : [] };
          }

          console.log( typeof $scope.sequence.parameters["CrossValidationCount"]);
        };

        $scope.addCVOutput = function(temp1,value1) {
          var temp = {temp1,value1} ;
          $scope.sequence.parameters["CrossValidationOutput"].push(temp);
        }

        $scope.reset = function() {
            $scope.sequence = angular.copy($scope.master);
        };
        $scope.reset();
        $scope.saveCrossBlock = function () {
          
          localStorage.setItem($scope.sequence.ID, JSON.stringify($scope.sequence));
        };

        $scope.uploadData = function (id) {
          // Ici, on reconvertit la chaîne en un objet 
          // JSON.stringify and saved in localStorage in JSON object again
          var sessionRestaurée = JSON.parse(localStorage.getItem(id));
          try {
            if (sessionRestaurée.ID != null)
              $scope.sequence = sessionRestaurée;
          } catch(e) {
            // statements
            console.log("Pas d'id pour session");
          }
          
          // La variable sessionRestaurée contient désormais l'objet précédent
          // qui avait été sauvegardé dans localStorage
          console.log(sessionRestaurée);
        };
    })

    // Controllers here
    .controller("TreeController", function($scope, sharedId) {
      $scope.delete = function(data) {
          data.nodes = [];
      };
      $scope.add = function(data, newName) {
          var post = data.nodes.length + 1;
          var id = data.ID + '-' + post;

          data.nodes.push({name: newName, ID: id, nodes: []});
          console.log(id);
      };
      $scope.saveDataId = function (id) {
        sharedId.setProperty(id);
      };
      
      $scope.tree = [{name: "ProcessingSequence", ID: '1',  nodes: []}];
    })




  
    .config(config)
    .run(run)
  ;
  



  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function config($urlProvider, $locationProvider) {
    $urlProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
  }

  function run() {
    FastClick.attach(document.body);
  }

})();
