class HeredocOnly < Formula
  desc "Heredoc parser fixture"
  homepage "https://example.com"
  url "https://example.com/heredoc-only-1.0.0.tar.gz"
  sha256 "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

  def caveats
    <<~'TEXT'
      bottle do
      livecheck do
      test do
    TEXT
  end

  def install
    notice = <<-"MESSAGE"
      test do
    MESSAGE
    bin.write "heredoc-only", notice
  end
end
