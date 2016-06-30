'use strict';
var http = require('http');
var fs = require('fs');
angular.module('listFiles', [])
.controller('ctrlFiles', function($scope){
    $scope.getFiles = function (dir, fileList){
        console.log('here')
        fileList = fileList || [];
     
        var files = fs.readdirSync(dir);
        for(var i in files){
            if (!files.hasOwnProperty(i)) continue;
            var name = dir+'/'+files[i];
            if (fs.statSync(name).isDirectory()){
                getFiles(name, fileList);
            } else {
                fileList.push(name);
            }
        }
        console.log(fileList);
        return fileList;
    };
});

    


