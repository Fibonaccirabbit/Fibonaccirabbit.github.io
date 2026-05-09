# Fix for Ruby 3.2+ where tainted? was removed
# Required by Liquid 4.0.3 used with github-pages gem
module TaintedFix
  def tainted?
    false
  end
end

Object.prepend(TaintedFix) unless Object.method_defined?(:tainted?)
