class RubyBlockComment < Formula
  desc "Declarations outside comments remain visible"
  homepage "https://example.com/ruby-block-comment"
  url "https://example.com/ruby-block-comment-1.2.3.tar.gz"
  sha256 "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  depends_on "visible-before"

=begin
  desc "Ghost description"
  homepage "https://ghost.example.com"
  url "https://ghost.example.com/ghost-9.9.9.tar.gz"
  sha256 "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
  depends_on "ghost"
  bottle do
  end
  livecheck do
  end
  test do
  end
=end

  depends_on "visible-after"
end
