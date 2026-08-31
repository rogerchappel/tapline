class PercentLiterals < Formula
  notes = %q(
    desc "Phantom description"
    homepage "https://phantom.example"
    url "https://phantom.example/percent-literals-9.9.9.tar.gz"
    sha256 "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    version "9.9.9"
    depends_on "phantom"
    bottle do
    end
    livecheck do
    end
    test do
    end
  )
  interpolation = %Q{nested { text with depends_on "also-phantom" } content}

  desc "Percent literal analysis fixture"
  homepage "https://example.com/percent-literals"
  url "https://example.com/percent-literals-1.2.3.tar.gz"
  sha256 "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"

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
