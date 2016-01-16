Selection = new Mongo.Collection("selection");
Status = new Mongo.Collection("status");
Message = new Mongo.Collection("message");

if (Meteor.isClient) {

  Template.player1.helpers({
      'message': function(){
          return Message.find({player: "1"});
      }
  });

  Template.player2.helpers({
      'message': function(){
          return Message.find({player: "2"});
      }
  });

  Template.registerHelper('findWinner', function(p1, p2) {
    //0 for p1 win 1 for p2 win 3 for tie
    var p1MessageCount = Message.find({player: "1"}).count();
    var p2MessageCount = Message.find({player: "2"}).count();
    var m1Name = 'player1message'+(p1MessageCount+1);
    var m2Name = 'player2message'+(p2MessageCount+1);

    var winner;
    if (p1 == p2){
      winner = 2;
    }
    else{
      if (p1 == "rock"){
        winner = (p2 == "scissor");
      }
      else if (p1 == "paper"){
        winner = (p2 == "rock");
      }
      else {
        winner = (p2 == "paper");
      }
    }

    if (winner == 2){ //tie game
      Message.insert({
        name: m1Name,
        player: "1",
        message: "Game" + (p1MessageCount+1) + ": Your "+p1+ " tied with "+ p2+ "."
      });
      Message.insert({
        name: m2Name,
        player: "2",
        message: "Game" + (p1MessageCount+1) + ": Your "+p2+ " tied with "+ p1+ "."
      });
    }
    else if (winner == 1){ //player1 wins
      Message.insert({ //player2 wins
        name: m1Name,
        player: "1",
        message: "Game" + (p1MessageCount+1) + ": Your "+p1+ " beat player2's "+ p2+ " you WIN!"
      });
      Message.insert({
        name: m2Name,
        player: "2",
        message: "Game" + (p1MessageCount+1) + ": Your "+p2+ " lost to player1's "+ p1+ " you lose."
      });
    }
    else {
      Message.insert({
        name: m1Name,
        player: "1",
        message: "Game" + (p1MessageCount+1) + ": Your "+p1+ " lost to player2's "+ p2+ " you lose."
      });
      Message.insert({
        name: m2Name,
        player: "2",
        message: "Game" + (p1MessageCount+1) + ": Your "+p2+ " beat player1's "+ p1+ " you WIN!"
      });
    }
  });

  Template.registerHelper('restartGame', function(){
    Status.update(p1Status._id, {
      $set: {selected: false}
    })
    Status.update(p2Status._id, {
      $set: {selected: false}
    })
    Selection.update(p1Selection._id, {
      $set: {selection: "none"}
    })
    Selection.update(p2Selection._id, {
      $set: {selection: "none"}
    })
    Message.update
  });

  Template.registerHelper('result', function(){
    p1Status = Status.findOne({name:'P1Status'});
    p2Status = Status.findOne({name:'P2Status'});
    p1Message = Message.findOne({name:'P1Message'});
    p2Message = Message.findOne({name:'P2Message'});
    if (p1Status.selected == true && p2Status.selected == true){
      p1Selection = Selection.findOne({name:'P1Select'});
      p2Selection = Selection.findOne({name:'P2Select'});
      UI._globalHelpers.findWinner(p1Selection.selection, p2Selection.selection);
      UI._globalHelpers.restartGame();
    }
  });

  Template.player1.events({
    "click button": function (event) {
      event.preventDefault();

      var p1Status = Status.findOne({name:"P1Status"});
      var p1Selection = Selection.findOne({name:"P1Select"});

      Status.update(p1Status._id, {
        $set: {selected: true}
      })

      if (event.currentTarget.className=='rock') {
        Selection.update(p1Selection._id, {
          $set: {selection: "rock"}
        })
      }
      else if (event.currentTarget.className=='paper') {
        Selection.update(p1Selection._id, {
          $set: {selection: "paper"}
        })
      }
      else{
        Selection.update(p1Selection._id, {
          $set: {selection: "scissor"}
        })
      }

      //check and see if the other player made a selection then compare/output
      UI._globalHelpers.result();
    }
  })

  Template.player2.onCreated(function () {
    console.log('created');
  });

  Template.player2.events({
    "click button": function (event) {
      if (event.currentTarget.className != "clear"){
        event.preventDefault();

        var p2Status = Status.findOne({name:"P2Status"});
        var p2Selection = Selection.findOne({name:"P2Select"});

        Status.update(p2Status._id, {
          $set: {selected: true}
        })

        if (event.currentTarget.className=='rock') {
          Selection.update(p2Selection._id, {
            $set: {selection: "rock"}
          })
        }
        else if (event.currentTarget.className=='paper') {
          Selection.update(p2Selection._id, {
            $set: {selection: "paper"}
          })
        }
        else{
          Selection.update(p2Selection._id, {
            $set: {selection: "scissor"}
          })
        }

        //check and see if the other player made a selection then compare/output
        UI._globalHelpers.result();
      }
    }
  })

  Template.buttons.events({
    'click .clear': function(event){
      Meteor.call('removeAllMessages');
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
      //initialize the statuses,selection,output for both players as empty
      //will update later when players make selection
      if (!Status.findOne()){
        Status.insert({
          name: "P1Status",
          selected: false
        });

        Selection.insert({
          name: "P1Select",
          selection: "None"
        });

        Status.insert({
          name: "P2Status",
          selected: false
        });

        Selection.insert({
          name: "P2Select",
          selection: "None"
        });
      }
  });

  Meteor.methods({
    removeAllMessages: function() {
      return Message.remove({});
    }
  })
}

Router.route('/player1');

Router.route('/player2');

Router.route('/',{
  template: 'home'
})
