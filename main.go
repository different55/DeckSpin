package main

import (
	"context"
	_ "embed"
	"fmt"
	"github.com/saracen/fastzip"
	webview "github.com/webview/webview_go"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

//go:embed main.js
var initScript string

func main() {
	w := webview.New(true)
	defer w.Destroy()
	w.SetTitle("DeckSpin")
	w.SetSize(1280, 800, webview.HintNone)
	w.Navigate("https://spinsha.re")
	w.Bind("log", fmt.Println)
	w.Bind("installChart", InstallChart)
	w.Init(initScript)
	w.Run()
}

func InstallChart(url string) {
	println("Installing chart")

	// Make sure the URL is a SpinShare URL
	if !strings.HasPrefix(url, "https://spinsha.re/") {
		println("Not a SpinShare URL")
		return
	}

	// Make sure it's a chart download URL
	if !strings.HasSuffix(url, "/download") {
		println("Not a download URL")
		return
	}

	// Create a temporary file.
	tmp, err := os.CreateTemp("/tmp/", "deckspin")
	if err != nil {
		println("Failed to create temporary file")
		return
	}
	defer tmp.Close()

	// Download the ZIP file
	resp, err := http.Get(url)
	if err != nil {
		println("Failed to download ZIP file")
		return
	}
	defer resp.Body.Close()

	// Write the ZIP file to the temporary file
	_, err = io.Copy(tmp, resp.Body)
	if err != nil {
		println("Failed to write ZIP file")
		return
	}

	tmpInfo, err := tmp.Stat()
	if err != nil {
		print("Failed to get temporary file info")
		return
	}

	// Get user home directory.
	home, err := os.UserHomeDir()
	if err != nil {
		println("Failed to get user home directory")
		return
	}

	// Unzip the ZIP file
	e, err := fastzip.NewExtractorFromReader(tmp, tmpInfo.Size(), filepath.Join(home, ".steam/steam/steamapps/compatdata/1058830/pfx/drive_c/users/steamuser/AppData/LocalLow/Super Spin Digital/Spin Rhythm XD/Custom/"))
	if err != nil {
		print("Failed to create extractor")
		return
	}

	if err = e.Extract(context.Background()); err != nil {
		print("Failed to extract ZIP file")
		return
	}

	println("Chart installed")
}
