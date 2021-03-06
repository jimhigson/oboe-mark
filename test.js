// how long to wait at start to give browser a chance to optimise scripts   
var initialWait = 500;
var progressAtOnce = 1024; // fire progress with this many bytes      
var numberOfRuns = 40;
var numberOfRecords = 100;

function go(oboe, print, collectProfile){

   function generateTestJson(){
   
      var container = {
          "id": 1,
          "jsonrpc": "2.0",
          "total": 20000,
          "result": [] 
      };
   
      for (var i = 0; i < numberOfRecords; i++) {
         container.result.push({
            "id": i,
            "guid": "046447ee-da78-478c-b518-b612111942a5",
            "picture": "http://placehold.it/32x32",
            "age": i,
            "name": "Payton Murphy" + i,
            "company": "Robotomic" + i,
            "phone": "806-587-2379" + i,
            "email": "payton@robotomic.com" + i
         });
      }
      return JSON.stringify(container);
   }
   
   var startTime = Date.now();
   collectProfile && console.profile('oboe-mark');
      
   runTest( generateTestJson(), function(){
      var timeTaken = Date.now() - startTime;
      print(numberOfRuns, 'runs of', numberOfRecords, 'records took', timeTaken, 'ms');
      collectProfile && console.profileEnd('oboe-mark')
   });         
                           
   function runTest(content, doneCallback) {
                       
      setTimeout( function() {
                  
         perform(numberOfRuns);
      }, initialWait );         
   
      function perform(times){
       
         var idTotal = 0,
             ageTotal = 0,
             nodeCount = 0,
             instance;
                               
         instance = oboe()
            .node('!.$result..{age name company}', function(obj){
             
               nodeCount++;
               idTotal += obj.id;                   
            })
            .path('age', function(age){
   
               nodeCount++;                                 
               ageTotal += age;       
            })               
            .done(function(){
               if( nodeCount != 200 ) {
                  throw "wrong number of matches";
               }
                
               if( times == 0 ) {
                  doneCallback();
               } else {
                  perform(times-1);
               }            
            }).fail(function(e){
               print('there was a failure' + JSON.stringify(e));
            });
                        
         // pass in a drip at a time            
         for(     var dripStart = 0, dripEnd = progressAtOnce; 
                  dripStart < content.length; 
                  dripStart += progressAtOnce, dripEnd += progressAtOnce ) {
                                       
            instance.emit( 'content', content.substring(dripStart, dripEnd));
         }               
      }
   }
}

// if we are in Node export the go method
if( typeof exports !== 'undefined' ) {
   module.exports = go;
}
