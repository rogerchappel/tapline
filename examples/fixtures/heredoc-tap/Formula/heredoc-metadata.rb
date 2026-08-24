class HeredocMetadata < Formula
  desc "Declarations around heredocs remain visible"
  homepage "https://example.com/heredoc-metadata"
  depends_on "visible-before" => :build

  def install
    quoted = <<'RUBY'
desc "Misleading quoted description"
homepage "https://wrong.example/quoted"
url "https://wrong.example/quoted-9.9.9.tar.gz"
sha256 "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
version "9.9.9"
depends_on "phantom-quoted"
bottle do
livecheck do
test do
RUBY
    unquoted = <<-SHELL
      desc "Misleading unquoted description"
      depends_on "phantom-unquoted" => :test
    SHELL
    squiggly = <<~"TEXT"
      homepage "https://wrong.example/squiggly"
      depends_on macos: :sonoma
    TEXT
    first, second = <<~ONE, <<-`TWO`
      url "https://wrong.example/first-8.8.8.tar.gz"
      depends_on "phantom-first"
    ONE
      sha256 "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      version "8.8.8"
      depends_on "phantom-second"
    TWO
    bin.write "heredoc-metadata", quoted + unquoted + squiggly + first + second
  end

  url "https://example.com/heredoc-metadata-1.2.3.tar.gz"
  sha256 "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
  depends_on "visible-after"

  bottle do
    root_url "https://example.com/bottles"
  end

  livecheck do
    url :stable
  end

  test do
    assert true
  end
end
