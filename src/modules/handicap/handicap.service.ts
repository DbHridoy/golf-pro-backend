// handicap.service.ts
class HandicapService {
  getBestDifferentialsCount(roundCount: number) {
    if (roundCount < 3)
      return 0;
    if (roundCount <= 6)
      return 2;
    if (roundCount <= 8)
      return 3;
    if (roundCount <= 10)
      return 4;
    if (roundCount <= 12)
      return 5;
    if (roundCount <= 14)
      return 6;
    if (roundCount <= 16)
      return 7;
    if (roundCount <= 18)
      return 8;
    if (roundCount === 19)
      return 9;
    return 10; // 20 rounds
  }

  calculateHandicap(rounds: any[]) {
    const differentials = rounds
      .map((round) => {
        if (!round.courseRating || !round.slopeRating)
          return null;
        return ((round.score - round.courseRating) * 113) / round.slopeRating;
      })
      .filter(d => d !== null);

    const count = this.getBestDifferentialsCount(differentials.length);
    if (count === 0)
      return null;

    const best = differentials.sort((a, b) => a - b).slice(0, count);
    const average = best.reduce((sum, val) => sum + val, 0) / best.length;

    return Number.parseFloat((average * 0.96).toFixed(1));
  }
}

const handicapService = new HandicapService();
export default handicapService;
