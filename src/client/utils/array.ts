export function minBy<T>(arr: T[], criterion: (obj: T) => number) { 
    return extremumBy(arr, criterion, Math.min); 
};

export function maxBy<T>(arr: T[], criterion: (obj: T) => number) { 
    return extremumBy(arr, criterion, Math.max); 
};

export function extremumBy<T, TCriterion>(arr: T[], criterion: (obj: T) => TCriterion, extremum: (a: TCriterion, b: TCriterion) => TCriterion): T {
    if (arr.length === 0) {
        throw new Error(`Cannot find extremum of empty array`);
    }
    var best: T | undefined = undefined,
        bestCriterion: TCriterion | undefined = undefined;

    for (let element of arr) {
        let elementCriterion = criterion(element);
        if (!best) {
            best = element;
            bestCriterion = elementCriterion;
        } else {
            if (extremum(bestCriterion!, elementCriterion) === elementCriterion) {
                best = element;
                bestCriterion = elementCriterion;
            }
        }
    }

    return best!;
}