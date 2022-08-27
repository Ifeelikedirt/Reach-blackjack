import React from 'react';

const exports = {};

exports.Wrapper = class extends React.Component{
  render() {
    const {content} = this.props;
      return(
          <div>
            {content}   
          </div>    
      );
  }
}

exports.GetCard = class extends React.Component {
    render() {
      const {parent, playable, yourHand, enemyHand, waitForOpp, dealCards, getOpp, publishYourCard, getResults} = this.props;
      return (
        <div className="homepage__paragraph">
             <h3>Your hand is:</h3>
              <p>{yourHand}</p>
              <h3>Opponent hand is:</h3>
              <p>{enemyHand}</p>
          {(waitForOpp ? "Waiting for your opponents move":
          (dealCards ? "Dealing the cards...": 
          (getOpp ? "Getting opponent cards": 
          (publishYourCard? "Publishing your cards":
          (getResults ? "Game is over. Getting the results.":
          "Make your choice")))))}
          <br/>
          <button className="btn"
            disabled={!playable}
            onClick={() => parent.playHand(1)}
          >HIT</button>
          <button className="btn"
            disabled={!playable}
            onClick={() => parent.playHand(0)}
          >STAND</button>
        </div>
      );
    }
  }
//Add funcs here
exports.WaitingForResults = class extends React.Component {
  render() {
      const {yourHand, enemyHand}= this.props;
    return (
        <div className="homepage__paragraph">
              <h3>Your hand is:</h3>
              <p>{yourHand}</p>
              <h3>Opponent hand is:</h3>
              <p>{enemyHand}</p>
              <p>Waiting for results</p>
      </div>
    );
  }
}

exports.Done = class extends React.Component {
  render() {
    const {outcome} = this.props;
    const {yourHand, enemyHand, bal, standardUnit, sumA, sumB}= this.props;
    return (
        <div className="homepage__paragraph">
              <h3>Your hand is:</h3>
              <p>{yourHand}</p>
              <h3>Opponent hand is:</h3>
              <p>{enemyHand}</p>
              <h3>{outcome || 'Unknown'}</h3>
        
              <h3>Sum of your cards: </h3>
                <p>{sumA || "Unknown"}</p>
                <h3> Sum of opponents cards:</h3>
                <p>{sumB  || "Unknown"}</p>

        <p>Balance: {bal} {standardUnit}</p>
      </div>
    );
  }
}

exports.Timeout = class extends React.Component {
  render() {
    return (
        <div className="homepage__paragraph">
        There's been a timeout. (Someone took too long.)
      </div>
    );
  }
}

exports.SeeHands = class extends React.Component{
    render() {
        const {myHand, opponentsHand} = this.props;
        return(
            <div className="homepage__paragraph">
                <h3>Your hand is:</h3>
                <p>{myHand || "Unknown"}</p>
                <h3> Opponent hand is:</h3>
                <p>{opponentsHand || "Unknown"}</p>
            </div>
        );
    }
}

exports.SeeSum = class extends React.Component{
    render(){
        const {sum} = this.props;
        return(
            <div className="homepage__paragraph">
                <h3>Sum of Alice's cards:</h3>
                <p>{sum[0] || "Unknown"}</p>
                <h3> Sum of Bob's cards:</h3>
                <p>{sum[1]  || "Unknown"}</p>
            </div>
        );
    }
}

exports.SetGame = class extends React.Component{
    render(){
        const {firstCard, secondCard} = this.props;
        return(
            <div className="homepage__paragraph">
            <h3>Your cards are:</h3>
            <p>{ firstCard}
            , {secondCard}</p>
        </div>
        );
    }
}

export default exports;
