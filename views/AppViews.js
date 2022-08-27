import React from 'react';

const exports = {};

exports.Wrapper = class extends React.Component {
  render() {
    const {content} = this.props;
    return (
      <div className="homepage__container container">
        <header className="App-header" id="root">
          <h1 className="heading">Blackjack with reach</h1>
          {content}
        </header>
      </div>
    );
  }
}

exports.ConnectAccount = class extends React.Component {
  render() {
    return (
        <div className="homepage__paragraph">
        Please wait while we connect to your account.
        If this takes more than a few seconds, there may be something wrong.
      </div>
    )
  }
}

exports.Entry = class extends React.Component {
  render() {
    const {bal, standardUnit, defaultFundAmt, parent} = this.props;
    return (
      <div className="homepage__paragraph">
        <h2>Rules</h2>
        <ul>
          <li>At the beginning of each round, all players place their bets. After the bets have been placed, the player is given two cards. One revealed and one hidden.</li>
          <li>   The player is given a chance to draw more cards. The players can either ‘hit’ or ‘stand’. If the player calls out ‘HIT’, they are given an extra card. They can then either call out ‘HIT’ again, or ‘STAND’ if they do not wish to draw any more cards. The player can ‘HIT’ as many times as they wish, but have to aim not to ‘bust’ (exceed a total of 21).</li>
          <li>If the player busts, they immediately lose their bet.</li>
          <li>After each player has played and either stood or busted, the dealer takes their turn. They can, again, either ‘HIT’ or ‘STAND’.</li>
        </ul>
        Balance: {bal} {standardUnit}
        <button className="homepage__btn btn" onClick={() => parent.skipEntry()}>Start the Game</button>
      </div>
    );
  }
}

exports.DeployerOrAttacher = class extends React.Component {
  render() {
    const {parent} = this.props;
    return (
      <div className="homepage__paragraph">
        <h2 className="role__heading">Please select a role:</h2>
        <div className="homepage__role">
         <p>Set the wager, deploy the contract.</p>
          <button className="homepage__btn btn"
            onClick={() => parent.selectDeployer()}
          >Dealer</button>
        </div>
        <div className="homepage__role">
          <p>Attach to the Deployer's contract.</p>
          <button className="homepage__btn btn"
            onClick={() => parent.selectAttacher()}
          >Player</button>
        </div>
      </div>
    );
  }
}

export default exports;
