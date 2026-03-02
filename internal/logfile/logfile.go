package logfile

import (
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/k1LoW/mo/internal/xdg"
)

const (
	maxSize    = 10 * 1024 * 1024 // 10MB
	maxBackups = 3
	maxAge     = 7 * 24 * time.Hour
)

// Setup configures slog to write to a rotating log file under XDG_STATE_HOME/mo/log/.
// Returns a cleanup function that closes the log file.
func Setup(port int) (func(), error) {
	stateHome, err := xdg.StateHome()
	if err != nil {
		return nil, fmt.Errorf("cannot determine XDG state home: %w", err)
	}
	dir := filepath.Join(stateHome, "mo", "log")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, err
	}

	cleanOldLogs(dir, maxAge)

	filename := filepath.Join(dir, fmt.Sprintf("mo-%d.log", port))
	w, err := newRotatingWriter(filename, maxSize, maxBackups)
	if err != nil {
		return nil, err
	}

	slog.SetDefault(slog.New(slog.NewJSONHandler(w, nil)))

	return func() { w.Close() }, nil
}

func cleanOldLogs(dir string, age time.Duration) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return
	}
	now := time.Now()
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		info, err := e.Info()
		if err != nil {
			continue
		}
		if now.Sub(info.ModTime()) > age {
			os.Remove(filepath.Join(dir, e.Name()))
		}
	}
}

// rotatingWriter is an io.Writer that rotates log files by size.
type rotatingWriter struct {
	filename   string
	maxSize    int64
	maxBackups int

	mu   sync.Mutex
	file *os.File
	size int64
}

func newRotatingWriter(filename string, maxSize int64, maxBackups int) (*rotatingWriter, error) {
	f, err := os.OpenFile(filename, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		return nil, err
	}
	info, err := f.Stat()
	if err != nil {
		f.Close()
		return nil, err
	}
	return &rotatingWriter{
		filename:   filename,
		maxSize:    maxSize,
		maxBackups: maxBackups,
		file:       f,
		size:       info.Size(),
	}, nil
}

func (w *rotatingWriter) Write(p []byte) (n int, err error) {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.size+int64(len(p)) > w.maxSize {
		if err := w.rotate(); err != nil {
			return 0, err
		}
	}

	n, err = w.file.Write(p)
	w.size += int64(n)
	return
}

func (w *rotatingWriter) Close() error {
	w.mu.Lock()
	defer w.mu.Unlock()
	return w.file.Close()
}

func (w *rotatingWriter) rotate() error {
	if err := w.file.Close(); err != nil {
		return err
	}

	// Remove oldest backup
	oldest := fmt.Sprintf("%s.%d", w.filename, w.maxBackups)
	os.Remove(oldest)

	// Shift existing backups: .2 -> .3, .1 -> .2
	for i := w.maxBackups - 1; i >= 1; i-- {
		from := fmt.Sprintf("%s.%d", w.filename, i)
		to := fmt.Sprintf("%s.%d", w.filename, i+1)
		if err := os.Rename(from, to); err != nil && !os.IsNotExist(err) {
			return err
		}
	}

	// Current -> .1
	if err := os.Rename(w.filename, w.filename+".1"); err != nil && !os.IsNotExist(err) {
		return err
	}

	f, err := os.OpenFile(w.filename, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		return err
	}
	w.file = f
	w.size = 0
	return nil
}
