class HelloTapline < Formula
  desc "Tiny fixture formula for tapline reports"
  homepage "https://example.com/hello-tapline"
  url "https://example.com/hello-tapline-1.2.3.tar.gz"
  sha256 "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  license "MIT"

  livecheck do
    url :homepage
    regex(/hello-tapline[._-]v?(\d+(?:\.\d+)+)\.t/i)
  end

  def install
    bin.write "hello-tapline", "#!/bin/sh\necho hello tapline\n"
  end

  test do
    assert_match "hello tapline", shell_output("#{bin}/hello-tapline")
  end
end
