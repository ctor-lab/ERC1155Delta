const { deployContract, offsettedIndex } = require('../helpers.js');
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { constants } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    let offsetted;

    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc1155deltaQueryable = await deployContract(contract, constructorArgs);

        this.startTokenId = this.erc1155deltaQueryable.startTokenId
          ? (await this.erc1155deltaQueryable.startTokenId()).toNumber()
          : 0;

        offsetted = (...arr) => offsettedIndex(this.startTokenId, arr);
      });

      context('with no minted tokens', async function () {
        beforeEach(async function () {
          const [owner, addr1] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
        });

        describe('tokensOfOwner', async function () {
          it('returns empty array', async function () {
            expect(await this.erc1155deltaQueryable.tokensOfOwner(this.owner.address)).to.eql([]);
            expect(await this.erc1155deltaQueryable.tokensOfOwner(this.addr1.address)).to.eql([]);
          });
        });

        describe('tokensOfOwnerIn', async function () {
          it('returns empty array', async function () {
            expect(await this.erc1155deltaQueryable.tokensOfOwnerIn(this.owner.address, 0, 9)).to.eql([]);
            expect(await this.erc1155deltaQueryable.tokensOfOwnerIn(this.addr1.address, 0, 9)).to.eql([]);
          });
        });

        describe('balanceOf(address)', async function () {
          it('returns 0', async function () {
            expect(await this.erc1155deltaQueryable["balanceOf(address)"](this.owner.address)).to.equal("0");
            expect(await this.erc1155deltaQueryable["balanceOf(address)"](this.owner.address)).to.equal("0");
          });
        });

        describe('balanceOf(address,uint256,uint256)', async function () {
            it('returns 0', async function () {
              expect(await this.erc1155deltaQueryable["balanceOf(address,uint256,uint256)"](this.owner.address,0,9)).to.equal("0");
              expect(await this.erc1155deltaQueryable["balanceOf(address,uint256,uint256)"](this.owner.address,0,9)).to.equal("0");
            });
          });

        
      });

      context('with minted tokens', async function () {
        beforeEach(async function () {
          const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
          this.addr2 = addr2;
          this.addr3 = addr3;
          this.addr4 = addr4;

          this.addr1.expected = {
            balance: 1,
            tokens: [offsetted(0)],
          };

          this.addr2.expected = {
            balance: 2,
            tokens: offsetted(1, 2),
          };

          this.addr3.expected = {
            balance: 3,
            tokens: offsetted(3, 4, 5),
          };

          this.addr4.expected = {
            balance: 0,
            tokens: [],
          };

          this.owner.expected = {
            balance: 3,
            tokens: offsetted(6, 7, 8),
          };

          this.lastTokenId = offsetted(8);
          this.currentIndex = this.lastTokenId.add(1);

          this.mintOrder = [this.addr1, this.addr2, this.addr3, this.addr4, owner];

          for (const minter of this.mintOrder) {
            const balance = minter.expected.balance;
            if (balance > 0) {
              await this.erc1155deltaQueryable['mint(address,uint256)'](minter.address, balance);
            }
            // sanity check
            //
          }
        });

        describe('tokensOfOwner', async function () {
          it('initial', async function () {
            for (const minter of this.mintOrder) {
              const tokens = await this.erc1155deltaQueryable.tokensOfOwner(minter.address);
              expect(tokens).to.eql(minter.expected.tokens);
              expect(await this.erc1155deltaQueryable["balanceOf(address)"](minter.address)).to.equal(minter.expected.balance);
            }
          });

          it('after a transfer', async function () {
            // Break sequential order by transfering 7th token from owner to addr4
            const tokenIdToTransfer = [offsetted(7)];
            await this.erc1155deltaQueryable.safeTransferFrom(this.owner.address, this.addr4.address, tokenIdToTransfer[0], 1, []);

            // Load balances
            const ownerTokens = await this.erc1155deltaQueryable.tokensOfOwner(this.owner.address);
            const addr4Tokens = await this.erc1155deltaQueryable.tokensOfOwner(this.addr4.address);

            // Verify the function can still read the correct token ids
            expect(ownerTokens).to.eql(offsetted(6, 8));
            expect(addr4Tokens).to.eql(tokenIdToTransfer);
          });

          it('after a burn', async function () {
            // Burn tokens
            const tokenIdToBurn = [offsetted(7)];
            await this.erc1155deltaQueryable["burn(address,uint256)"](this.owner.address, tokenIdToBurn[0]);

            // Load balances
            const ownerTokens = await this.erc1155deltaQueryable.tokensOfOwner(this.owner.address);

            // Verify the function can still read the correct token ids
            expect(ownerTokens).to.eql(offsetted(6, 8));

            // Verify the balance is updated.
            expect(await this.erc1155deltaQueryable["balanceOf(address)"](this.owner.address)).to.equal(2);
          });
        });

        describe('tokensOfOwnerIn', async function () {
          const expectCorrect = async function (addr, start, stop) {
            if (BigNumber.from(start).gte(BigNumber.from(stop))) {
              await expect(this.erc721aQueries.tokensOfOwnerIn(addr, start, stop)).to.be.revertedWith(
                'InvalidQueryRange'
              );
            } else {
              const expectedTokens = (await this.erc1155deltaQueryable.tokensOfOwner(addr)).filter(
                (x) => BigNumber.from(start).lte(x) && BigNumber.from(stop).gt(x)
              );
              const tokens = await this.erc1155deltaQueryable.tokensOfOwnerIn(addr, start, stop);
              expect(tokens).to.eql(expectedTokens);
            }
          };

          const subTests = function (description, beforeEachFunction) {
            describe(description, async function () {
              it('all token ids', async function () {
                await beforeEachFunction.call(this);
                await expectCorrect.call(this, this.owner.address, offsetted(0), this.currentIndex);
                await expectCorrect.call(this, this.owner.address, offsetted(0), this.currentIndex.add(1));
              });

              it('partial token ids', async function () {
                await beforeEachFunction.call(this);
                const ownerTokens = this.owner.expected.tokens;
                const start = ownerTokens[0];
                const stop = ownerTokens[ownerTokens.length - 1] + 1;
                for (let o = 1; o <= ownerTokens.length; ++o) {
                  // Start truncated.
                  await expectCorrect.call(this, this.owner.address, start + o, stop);
                  // End truncated.
                  await expectCorrect.call(this, this.owner.address, start, stop - o);
                  // Start and end truncated. This also tests for start + o >= stop - o.
                  await expectCorrect.call(this, this.owner.address, start + o, stop - o);
                }
                for (let o = 0, n = parseInt(this.currentIndex) + 1; o <= n; ++o) {
                  // Sliding window.
                  await expectCorrect.call(this, this.owner.address, o, o + ownerTokens.length);
                }
              });
            });
          };

          subTests('initial', async function () {});

          subTests('after a token tranfer', async function () {
            await this.erc1155deltaQueryable.safeTransferFrom(this.owner.address, this.addr4.address, offsetted(7), 1, []);
          });

          subTests('after a token burn', async function () {
            await this.erc1155deltaQueryable["burn(address,uint256)"](this.owner.address, offsetted(7));
          });
        });

        
      });
    });
  };

describe(
  'ERC1155DeltaQueryable',
  createTestSuite({
    contract: 'ERC1155DeltaQueryableMock',
    constructorArgs: [''],
  })
);

describe(
    'ERC1155DeltaQueryable override _startTokenId()',
    createTestSuite({
      contract: 'ERC1155DeltaQueryableStartTokenIdMock',
      constructorArgs: [''],
    })
);

describe(
    'ERC1155DeltaQueryableUpgradeable',
    createTestSuite({
      contract: 'ERC1155DeltaQueryableMockUpgradeableWithInit',
      constructorArgs: [''],
    })
);


describe(
    'ERC1155DeltaQueryableUpgradeable override _startTokenId',
    createTestSuite({
      contract: 'ERC1155DeltaQueryableStartTokenIdMockUpgradeableWithInit',
      constructorArgs: [''],
    })
);
  
