class HeredocAdjacent < Formula
  desc "Adjacent heredoc parser fixture"
  homepage "https://example.com"
  url "https://example.com/heredoc-adjacent-1.0.0.tar.gz"
  sha256 "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

  bottle do
    root_url "https://example.com/bottles"
  end

  def caveats
    <<-`TEXT`
      bottle do
      livecheck do
      test do
    TEXT
  end

  livecheck do
    url :stable
  end

  test do
    assert true
  end
end
