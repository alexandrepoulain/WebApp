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
          var object = {};
          object[key] = value ;
          var ret =  JSON.stringify(object);
          $scope.sequence.inputs.push(ret) ;
          $scope.saveProcessBlock();
        };
        // add outputs
        $scope.addOutputs = function (key,value) {
          var object = {};
          object[key] = value ;
          var ret =  JSON.stringify(object);
          $scope.sequence.outputs.push(object);
          $scope.saveProcessBlock();
        };
        // add element in list parameters
        $scope.addParameter = function (key,value) {
          var object = {};
          object[key] = value ;
          var ret =  JSON.stringify(object);
          $scope.sequence.parameters.push(object);
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
        // take the id of the node
        var id = sharedId.getProperty();
        // var for the reset
        $scope.master = {Name: "CrossValidationBlock", ID: id, "CrossValidationType": ""};
        
        // function to choose the type of CV we want
        $scope.chooseTypeCV = function(type) {
          // in function on the type we give the parameters
          $scope.sequence["CrossValidationType"] = type ;
          // add CVCount 
          if(type == 'k-fold' || type == 'bootstrapping'){
            $scope.sequence.parameters = { "CrossValidationCount" : "", 
                                          "CrossValidationOutput" : [] };
          }
          // No CVCount 
          if(type == 'leave-one-out'){
            $scope.sequence.parameters = { "CrossValidationOutput" : [] }
          }

          console.log( typeof $scope.sequence.parameters["CrossValidationCount"]);
        };

        // add the CV Outputs (we make a list of them)
        $scope.addCVOutput = function(temp1,value1) {
          
          var object = {};
          object[temp1] = value1 ;
          var ret =  JSON.stringify(object);
          $scope.sequence.parameters.CrossValidationOutput.push(ret) ;
          $scope.saveCrossBlock();
        };

        // add a ParameterSearch Block
        $scope.addParameterSearchBlock = function () {
            // we make the block and then we put him into the block sequence 
            var ParameterSearchBlock = {"ParameterSearch": []};
            $scope.sequence.parameters["ParameterSearch"] = [];
            $scope.sequence.parameters["OptimizedOutput"] = "";
            $scope.sequence.parameters["OptimizationType"] = "";
        };
        // add a ParameterSearch
        $scope.addParameterSearch = function () {
            // creation of the element 
            var ParameterSearchVar = {
              "Name" : "",
              "TypeValue" : "",
              "TypeRange" : "",
              "Values" : [],
              "SearchType" : "",
              "SearchCount" : ""
            };
            $scope.sequence.parameters["ParameterSearch"].push(ParameterSearchVar);
        };
        // add a value 
        $scope.addCvValues = function(key2, number){
          $scope.sequence.parameters.ParameterSearch[key2]['Values'].push(number);
          $scope.saveCrossBlock();
        };
        // set the OptimizationType
        $scope.setOptimizationType = function (param) {
           $scope.sequence.parameters['OptimizationType'] = param ;
           $scope.saveCrossBlock();
        }

        // take the var for the reset
        $scope.reset = function() {
            $scope.sequence = angular.copy($scope.master);
        };
        $scope.reset();

        // save the block to local storage
        $scope.saveCrossBlock = function () {
          console.log($scope.sequence);
          localStorage.setItem($scope.sequence.ID, JSON.stringify($scope.sequence));
        };

        // find the block saved for the id 
        $scope.uploadData = function (id) {
          var sessionRestaured = JSON.parse(localStorage.getItem(id));
          try {
            if (sessionRestaured.ID != null)
              $scope.sequence = sessionRestaured;
          } catch(e) {
            console.log("Pas d'id pour session");
          }
          
          console.log(sessionRestaured);
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
      };

      $scope.parseData = function (data) {
        // Get the Block corresponding 
        var block = JSON.parse(localStorage.getItem(data.ID));
        // supprimer l'ID
        
        if (block){
          delete block["Name"] ;
          delete block["ID"] ;
          if (block.hasOwnProperty("parameters"))
          {
            for (var key3 in block["parameters"]){
              block[key3] = block["parameters"][key3];
            }
            delete block["parameters"]
          }
        }
        

        console.log(block)
        // in function of the name we create the object
        if (data.name == "ProcessingSequence" || data.name == "TrainingProcessingBlock" || data.name == "ValidationProcessingBlock"){
          // if this is a ProcessingSequence/TrainingProcessingBlock/ValidationProcessingBlock we create a list
          var object = [] ;
          // if it has sons 
          if ( data.nodes.length != 0 )
          {
            // we take his sons 
            for(var j = 0, length2 = data.nodes.length; j < length2; j++){
              var son = $scope.parseData(data.nodes[j]);
              object.push(son);
            }
          }
        }
        else if (data.name == "CrossValidationBlock" || data.name == "ProcessingBlock"){
          // if this is a CrossValidationBlock/ProcessingBlock we create a list
          var object = {} ;
          // if it has sons 
          if ( data.nodes.length != 0 )
          {
            // we take his sons 
            for(var j = 0, length2 = data.nodes.length; j < length2; j++){
              var son = $scope.parseData(data.nodes[j]);
              console.log(son);
              // Prolem if two validation bloc for eg
              for (var key in son){
                object[key] = son[key] ;
              }
             
              
            }
          }
          // add the parameters of the block
            for (var key2 in block){
              console.log(key2)
              object[key2] = block[key2] ;
            }

          
          
        }

        //  the block to return we create
        var element = {}
        element[data.name] = object ;
        return element ;


      }

      $scope.saveJson = function (data) {
        var newData = $scope.parseData(data);
        console.log(newData);
        localStorage.setItem("dataToSave", angular.toJson(newData));
      };

      $scope.saveToPc = function (filename) {

        var data = localStorage.getItem("dataToSave");
        if (!data) {
          console.error('No data');
          return;
        }

        if (!filename) {
          filename = 'download.json';
        }

        if (typeof data === 'object') {
          data = JSON.stringify(data, undefined, 2);
        }

        var blob = new Blob([data], {type: 'text/json'}),
          e = document.createEvent('MouseEvents'),
          a = document.createElement('a');

        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initEvent('click', true, false, window,
            0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
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
