'reach 0.1';

const winner = (distA, distB) =>
  (distA < distB ? 2 : (distB < distA ? 0 : 1))
  
function distanceFrom(distFrom, distTo) {
  if (distFrom > distTo) {
    return 2 * (distFrom - distTo);
  }
  else {
    return (distTo - distFrom);
  }
}
const cardValue = (i) =>
  (i < 10 ? i : 10)

const Player =
{
  ...hasRandom,
  getCard: Fun([], UInt),
  seeOutcome: Fun([UInt, UInt, UInt], Null),
  updateOpponentHand: Fun([UInt], Null),
  informTimeout: Fun([], Null),
  setGame: Fun([], Tuple(UInt, UInt)),
  revelLastCard: Fun([UInt], Null),
  getResultView: Fun([], Null),
  printThis: Fun([UInt], Null),
};

const PlayerOne =
{
  ...Player,
  wager: UInt,
  deadline: UInt,
};
const DealerOne =
{
  ...Player,
  acceptWager: Fun([UInt], Null)
};

export const main =
  Reach.App(
    {},
    [Participant('PlayerOne', PlayerOne), Participant('DealerOne', DealerOne)],
    (A, B) => {
      const informTimeout = () => {
        each([A, B], () => {
          interact.informTimeout();
        });
      };


      A.only(() => {
        const wager = declassify(interact.wager);
        const deadline = declassify(interact.deadline);
      });
      A.publish(wager, deadline).pay(wager);
      commit();

      B.only(() => { 
        interact.acceptWager(wager);
      });
      B.pay(wager).timeout(relativeTime(deadline), () => closeTo(A, informTimeout));
      commit();

      A.only(() => { 
        const [_handA_First, _handA_Second] = interact.setGame();
        const [_commitA, _saltA] = makeCommitment(interact, _handA_First);
        const commitA = declassify(_commitA);
        const handA_Second = declassify(_handA_Second);
      });
      A.publish(commitA, handA_Second).timeout(relativeTime(deadline), () => closeTo(B, informTimeout));
      commit();

      B.only(() => { 
        const [_handB_First, _handB_Second] = interact.setGame();
        const [_commitB, _saltB] = makeCommitment(interact, _handB_First);
        const commitB = declassify(_commitB);
        const handB_Second = declassify(_handB_Second);
      });
      B.publish(commitB, handB_Second).timeout(relativeTime(deadline), () => closeTo(A, informTimeout));
      A.only(() => { 
        interact.updateOpponentHand(handB_Second);
      });

      B.only(() => { 
        interact.updateOpponentHand(handA_Second);
      });


      var [aHits, bHits, sumA, sumB, ACEcountA, ACEcountB, turn] = [1, 1, cardValue(handA_Second), cardValue(handB_Second), 0, 0, 0];
      invariant(balance() == 2 * wager);
      while (aHits > 0 || bHits > 0) {

        if (turn == 0 && sumA < 21) {
          commit();
          A.only(() => {
            const cardA = declassify(interact.getCard());
          });
          A.publish(cardA).timeout(relativeTime(deadline), () => closeTo(B, informTimeout));

          B.only(() => {
            interact.updateOpponentHand(cardA);
          });

          if (cardA == 1) {
            [aHits, sumA, ACEcountA, turn] = [cardA, sumA + cardValue(cardA), ACEcountA + 1, 1];
            continue;
          }

          [aHits, sumA, turn] = [cardA, sumA + cardValue(cardA), 1]
          continue;
        }

        if (sumB < 21) {
          commit();
          B.only(() => {
            const cardB = declassify(interact.getCard());
          });
          B.publish(cardB).timeout(relativeTime(deadline), () => closeTo(A, informTimeout));
          A.only(() => {
            interact.updateOpponentHand(cardB);
          });

          if (cardB == 1) {
            [bHits, sumB, ACEcountB, turn] = [cardB, sumB + cardValue(cardB), ACEcountB + 1, 0];
            continue;
          }
          [bHits, sumB, turn] = [cardB, sumB + cardValue(cardB), 0]
          continue;
        }

        commit();
        A.publish(); 
        [aHits, bHits] = [0, 0];
        continue;
      }
      commit();

      A.only(() => { 
        interact.getResultView();
        const [saltA, handA_First] = declassify([_saltA, _handA_First]);
      });
      A.publish(saltA, handA_First).timeout(relativeTime(deadline), () => closeTo(B, informTimeout));
      checkCommitment(commitA, saltA, handA_First);
      commit();

      B.only(() => { 
        interact.getResultView();
        const [saltB, handB_First] = declassify([_saltB, _handB_First]);
      });
      B.publish(saltB, handB_First).timeout(relativeTime(deadline), () => closeTo(A, informTimeout));
      checkCommitment(commitB, saltB, handB_First);

    
      const A_totalBeforeAce = sumA + cardValue(handA_First);
      const finalTotalA = (ACEcountA > 0 || handA_First == 1) ?
        ((distanceFrom(A_totalBeforeAce + 10, 21) < distanceFrom(A_totalBeforeAce, 21)) ? A_totalBeforeAce + 10 : A_totalBeforeAce)
        : A_totalBeforeAce;

      const B_totalBeforeAce = sumB + cardValue(handB_First);
      const finalTotalB = (ACEcountB > 0 || handB_First == 1) ?
        ((distanceFrom(B_totalBeforeAce + 10, 21) < distanceFrom(B_totalBeforeAce, 21)) ? B_totalBeforeAce + 10 : B_totalBeforeAce)
        : B_totalBeforeAce;

      const outcome = winner(distanceFrom(finalTotalA, 21), distanceFrom(finalTotalB, 21));

      const [forA, forB] =
        outcome == 2 ? [2, 0] :
          outcome == 0 ? [0, 2] :
            [1, 1];
      transfer(forA * wager).to(A);
      transfer(forB * wager).to(B);
      commit();

      A.only(() => { 
        interact.revelLastCard(handB_First);
      });

      B.only(() => {
        interact.revelLastCard(handA_First);
      });

      each([A, B], () => {
        interact.seeOutcome(outcome, finalTotalA, finalTotalB);
      });

      exit();
    });