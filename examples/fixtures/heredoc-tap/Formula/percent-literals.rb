class PercentLiterals < Formula
  desc "Percent literal analysis fixture"
  homepage "https://example.com/percent-literals"
  url "https://example.com/percent-literals-1.2.3.tar.gz"
  sha256 "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"

  notes = %q(
    depends_on "phantom"
    bottle do
    end
    livecheck do
    end
    test do
    end
  )
  interpolation = %Q{nested { text with depends_on "also-phantom" } content}

  depends_on "visible" => :build
  depends_on macos: :ventura

  bottle do
    sha256 cellar: :any_skip_relocation, arm64_sequoia: "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  end

  livecheck do
    url :stable
  end

  test do
    system "true"
  end
end
