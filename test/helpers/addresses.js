/** Resolve contract or signer address (ethers v5 / hardhat). */
function resolveAddress(target) {
  if (!target) return target;
  if (typeof target === 'string') return target;
  if (target.address) return target.address;
  if (typeof target.getAddress === 'function') {
    return target.getAddress();
  }
  return target;
}

async function resolveAddressAsync(target) {
  const value = resolveAddress(target);
  return typeof value.then === 'function' ? value : value;
}

module.exports = { resolveAddress, resolveAddressAsync };
