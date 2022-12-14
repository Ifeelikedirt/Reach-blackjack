import React from 'react';
import AppViews from './views/AppViews';
import DeployerViews from './views/DeployerViews';
import AttacherViews from './views/AttacherViews';
import { renderDOM, renderView } from './views/render';
import './style.css';
import * as backend from './build/index.main.mjs';
import { loadStdlib } from '@reach-sh/stdlib';
import { ALGO_MyAlgoConnect as MyAlgoConnect } from '@reach-sh/stdlib';
stdlib.setWalletFallback(stdlib.walletFallback({
  providerEnv: 'TestNet', MyAlgoConnect }));
const reach = loadStdlib(process.env);

//reach.setSignStrategy('AlgoSigner');


const DECK = { 1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K' };
const { standartUnit } = reach;
const defaults = { defaultFundAmt: '10', defaultWager: '0', standartUnit };
// Both hands are held in arrays, to be provided in front end.
// opponentHand contains a "hidden" card as the first card is not published.
let opponentHand = ["?"];
let myHand = [];
let Who = 1;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { view: 'ConnectAccount', ...defaults };
  }
  async componentDidMount() {
    const acc = await reach.getDefaultAccount();
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);
    const faucet = await reach.getFaucet();
    await this.setState({ view: 'Entry', faucet, acc, bal });
    this.fundAccount(100);
  }
  async fundAccount(fundAmount) {
    await reach.transfer(this.state.faucet, this.state.acc, reach.parseCurrency(fundAmount));
    const balAtomic = await reach.balanceOf(this.state.acc);
    const bal = reach.formatCurrency(balAtomic, 4);
    this.setState({ view: 'Entry', bal, acc: this.state.acc});
  }
  async skipEntry() { this.setState({ view: 'DeployerOrAttacher' }); }
  selectAttacher() {
    this.setState({ view: 'Wrapper', ContentView: Attacher });
  }
  selectDeployer() {
    this.setState({ view: 'Wrapper', ContentView: Deployer });
  }
  render() { return renderView(this, AppViews); }

}

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = { view: 'ConnectAccount', ...defaults, isFirst: true };
  }
  random() { return reach.hasRandom.random(); }
  async getCard() { // Fun([], UInt)

    var card = await new Promise(resolveHandP => {
      this.setState({ view: 'GetCard', playable: true, resolveHandP, yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "), waitForOpp: false, dealCards: false, getOpp: false, publishYourCard: false, getResults: false});
    });
    if (card === 1) {
      card = Math.floor(Math.random() * 12) + 1;
      myHand.push(DECK[card]);

      this.setState({ view: 'GetCard', yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "), playable: false, waitForOpp: true, dealCards: false, getOpp: false, publishYourCard: false, getResults: false});
      return card;
    }
    else {
      this.setState({ view: 'GetCard', yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "), playable: false,  waitForOpp: true, dealCards: false, getOpp: false, publishYourCard: false, getResults: false});
      return 0;
    }
  }
 
  async setGame() {
    var hands = [];
    for (let index = 0; index < 2; index++) {
      var card = Math.floor(Math.random() * 12) + 1;

      myHand.push(DECK[card]);
      hands.push(card);
    }

    this.setState({ view: 'GetCard', playable: false, yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "),  waitForOpp: false, dealCards: true, getOpp: false, publishYourCard: false, getResults: false});
    return [hands[0], hands[1]];
  }

  async seeOutcome(i, _sumA, _sumB) {
    const balAtomic = await reach.balanceOf(this.props.acc);
    const balance = reach.formatCurrency(balAtomic, 4);
    const sumA = parseInt(_sumA);
    const sumB = parseInt(_sumB);

   
    this.setState({ view: 'Done', outcome: (i==Who ? "You won!":(i == 1 ? "It's a draw.":"Your opponent won.")), yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "), bal: balance, standartUnit: defaults[2],  sumA:(Who == 2 ? sumA:sumB ), sumB:(Who== 0 ? sumA:sumB ) });
  }
  informTimeout() { this.setState({ view: 'Timeout' }); }
  playHand(i) {
    this.state.resolveHandP(i ? 1 : 0);
  }
  updateOpponentHand(i) {
    if (i != 0) {
      opponentHand.push(DECK[i]);
    }
    this.setState({ view: 'GetCard', yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "), playable: false,  waitForOpp: true, dealCards: false, getOpp: false, publishYourCard: false, getResults: false});
  }
  revelLastCard(card) {
    opponentHand[0] = DECK[card];
  }
  getResultView(){
    this.setState({ view: 'GetCard', yourHand: myHand.join(", "), enemyHand: opponentHand.join(", "), playable: false,  waitForOpp: false, dealCards: false, getOpp: false, publishYourCard: false, getResults: true});
  }
  printThis(toPrint){ // For debugging purposes
    console.log(toPrint);
  }
}

class Deployer extends Player {
  constructor(props) {
    super(props);
    this.state = { view: 'SetWager' };
  }
  setWager(wager) { this.setState({ view: 'Deploy', wager }); }
  async deploy() {
    const ctc = this.props.acc.deploy(backend);
    this.setState({ view: 'Deploying', ctc });
    this.wager = reach.parseCurrency(this.state.wager); // UInt
    this.deadline = {ETH: 10, ALGO: 100, CFX: 1000}[reach.connector]; // UInt
    backend.PlayerOne(ctc, this);
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
    Who = 2;
    this.setState({ view: 'WaitingForAttacher',ctcInfoStr});
  }
  render() { return renderView(this, DeployerViews); }
}

class Attacher extends Player {
  constructor(props) {
    super(props);
    this.state = { view: 'Attach' };
  }
  attach(ctcInfoStr) {
    const ctc = this.props.acc.attach(backend, JSON.parse(ctcInfoStr));
    Who = 0;
    this.setState({ view: 'Attaching' });
    backend.DealerOne(ctc, this);
  }
  async acceptWager(wagerAtomic) { // Fun([UInt], Null)
    const wager = reach.formatCurrency(wagerAtomic, 4);
    return await new Promise(resolveAcceptedP => {
      this.setState({ view: 'AcceptTerms', wager, resolveAcceptedP });
    });
  }
  termsAccepted() {
    this.state.resolveAcceptedP();
    this.setState({ view: 'WaitingForTurn' });
  }
  render() { return renderView(this, AttacherViews); }
}

renderDOM(<App />);
