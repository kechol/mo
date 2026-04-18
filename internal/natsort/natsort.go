// Package natsort provides natural ordering for strings, where runs of
// ASCII digits are compared as non-negative integers. Non-digit runes are
// compared case-insensitively, with case acting as a tiebreaker.
package natsort

import "sort"

// Compare returns -1, 0, or 1 comparing a and b in natural order.
func Compare(a, b string) int {
	ar := []rune(a)
	br := []rune(b)
	i, j := 0, 0
	for i < len(ar) && j < len(br) {
		ac, bc := ar[i], br[j]
		if isDigit(ac) && isDigit(bc) {
			if c := compareDigitRun(ar, br, &i, &j); c != 0 {
				return c
			}
			continue
		}
		if ac == bc {
			i++
			j++
			continue
		}
		al, bl := toLower(ac), toLower(bc)
		if al != bl {
			if al < bl {
				return -1
			}
			return 1
		}
		// Same case-folded value but different case: lowercase sorts first.
		if ac > bc {
			return -1
		}
		return 1
	}
	switch {
	case i == len(ar) && j == len(br):
		return 0
	case i == len(ar):
		return -1
	default:
		return 1
	}
}

// Slice sorts s in place using natural order. The sort is stable.
func Slice(s []string) {
	sort.SliceStable(s, func(i, j int) bool {
		return Compare(s[i], s[j]) < 0
	})
}

// compareDigitRun compares the digit runs starting at *i in ar and *j in br,
// advancing *i and *j past the runs when the numeric values are equal.
// Returns -1, 0, or 1.
func compareDigitRun(ar, br []rune, i, j *int) int {
	aStart, aEnd := *i, *i
	for aEnd < len(ar) && isDigit(ar[aEnd]) {
		aEnd++
	}
	bStart, bEnd := *j, *j
	for bEnd < len(br) && isDigit(br[bEnd]) {
		bEnd++
	}

	// Trim leading zeros for numeric comparison (but keep at least one digit).
	aTrim := aStart
	for aTrim < aEnd-1 && ar[aTrim] == '0' {
		aTrim++
	}
	bTrim := bStart
	for bTrim < bEnd-1 && br[bTrim] == '0' {
		bTrim++
	}

	aLen := aEnd - aTrim
	bLen := bEnd - bTrim
	if aLen != bLen {
		if aLen < bLen {
			return -1
		}
		return 1
	}
	for k := 0; k < aLen; k++ {
		if ar[aTrim+k] != br[bTrim+k] {
			if ar[aTrim+k] < br[bTrim+k] {
				return -1
			}
			return 1
		}
	}

	// Numerically equal. Prefer fewer leading zeros so that "1" < "01".
	origA := aEnd - aStart
	origB := bEnd - bStart
	if origA != origB {
		if origA < origB {
			return -1
		}
		return 1
	}

	*i = aEnd
	*j = bEnd
	return 0
}

func isDigit(r rune) bool { return '0' <= r && r <= '9' }

func toLower(r rune) rune {
	if 'A' <= r && r <= 'Z' {
		return r + ('a' - 'A')
	}
	return r
}
