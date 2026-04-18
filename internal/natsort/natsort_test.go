package natsort

import (
	"reflect"
	"testing"
)

func TestCompare(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name string
		a, b string
		want int
	}{
		{"equal empty", "", "", 0},
		{"empty vs nonempty", "", "a", -1},
		{"nonempty vs empty", "a", "", 1},
		{"equal", "abc", "abc", 0},
		{"ascii lex", "a", "b", -1},

		{"digit basic", "i1", "i2", -1},
		{"digit across boundary", "i2", "i10", -1},
		{"digit across boundary rev", "i10", "i2", 1},
		{"numeric in middle", "a1b", "a10b", -1},

		{"leading zero equal numeric", "1", "01", -1},
		{"leading zero both", "001", "01", 1},
		{"leading zero numeric differs", "02", "10", -1},

		{"long vs short number", "i9", "i10", -1},
		{"very large", "v1000000000000000", "v999999999999999", 1},

		{"suffix decides", "i10", "i10a", -1},
		{"prefix decides", "i", "i1", -1},

		{"case-insensitive primary", "a", "B", -1},
		{"case tiebreak lower first", "a", "A", -1},
		{"case tiebreak upper after", "A", "a", 1},

		{"multi-digit groups", "v1.2", "v1.10", -1},
		{"multi-digit groups reverse", "v1.10", "v1.2", 1},
		{"mixed segments", "v2.1", "v10.1", -1},

		{"unicode equal", "あ", "あ", 0},
		{"unicode ordering", "あ", "い", -1},

		{"filename with ext", "i2.md", "i10.md", -1},
		{"filename prefix differs", "a10.md", "b1.md", -1},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			got := Compare(tc.a, tc.b)
			if got != tc.want {
				t.Errorf("Compare(%q, %q) = %d, want %d", tc.a, tc.b, got, tc.want)
			}
			// Anti-symmetry: Compare(b, a) should be the negation.
			rev := Compare(tc.b, tc.a)
			if rev != -tc.want {
				t.Errorf("Compare(%q, %q) = %d, want %d (anti-symmetry)", tc.b, tc.a, rev, -tc.want)
			}
		})
	}
}

func TestSlice(t *testing.T) {
	t.Parallel()

	t.Run("i1..i13 filenames", func(t *testing.T) {
		t.Parallel()
		in := []string{
			"i1.md", "i10.md", "i11.md", "i12.md", "i13.md",
			"i2.md", "i3.md", "i4.md", "i5.md", "i6.md",
			"i7.md", "i8.md", "i9.md",
		}
		want := []string{
			"i1.md", "i2.md", "i3.md", "i4.md", "i5.md",
			"i6.md", "i7.md", "i8.md", "i9.md", "i10.md",
			"i11.md", "i12.md", "i13.md",
		}
		Slice(in)
		if !reflect.DeepEqual(in, want) {
			t.Errorf("Slice = %v, want %v", in, want)
		}
	})

	t.Run("absolute paths", func(t *testing.T) {
		t.Parallel()
		in := []string{
			"/tmp/dir/i10.md",
			"/tmp/dir/i2.md",
			"/tmp/dir/i1.md",
		}
		want := []string{
			"/tmp/dir/i1.md",
			"/tmp/dir/i2.md",
			"/tmp/dir/i10.md",
		}
		Slice(in)
		if !reflect.DeepEqual(in, want) {
			t.Errorf("Slice = %v, want %v", in, want)
		}
	})

	t.Run("stable for equal keys", func(t *testing.T) {
		t.Parallel()
		// Inputs whose digit values are equal but differ in leading zeros
		// should retain relative order among identical inputs.
		in := []string{"b", "a1", "a01", "a1", "a"}
		want := []string{"a", "a1", "a1", "a01", "b"}
		Slice(in)
		if !reflect.DeepEqual(in, want) {
			t.Errorf("Slice = %v, want %v", in, want)
		}
	})
}
