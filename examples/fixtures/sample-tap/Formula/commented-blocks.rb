class CommentedBlocks < Formula
  desc "Fixture with block-like text only in comments and strings"
  homepage "https://example.com/commented-blocks"
  url "https://example.com/commented-blocks-1.0.0.tar.gz"
  sha256 "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"

  # bottle do
    # livecheck do
  # test do

  def install
    prefix.install "README.md" # test do
    ohai "bottle do and livecheck do are documentation text"
    ohai 'test do is still string content'
  end
end
