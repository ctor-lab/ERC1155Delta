const { deployContract, getBlockTimestamp, mineBlockTimestamp, offsettedIndex } = require('./helpers.js');
const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { constants } = require('@openzeppelin/test-helpers');
const { ethers } = require('hardhat');
const { ZERO_ADDRESS } = constants;

const ERC1155_ACCEPTED = '0xf23a6e61';
const ERC1155_BATCH_ACCEPTED = '0xbc197c81';
const GAS_MAGIC_VALUE = 20000;

const createTestSuite = ({ contract, constructorArgs }) =>
  function () {
    let offsetted;

    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc1155delta = await deployContract(contract, constructorArgs);
        this.receiver = await deployContract('ERC1155ReceiverMock', [ERC1155_ACCEPTED, ERC1155_BATCH_ACCEPTED, this.erc1155delta.address]);
        this.startTokenId = this.erc1155delta.startTokenId ? (await this.erc1155delta.startTokenId()).toNumber() : 0;

        offsetted = (...arr) => offsettedIndex(this.startTokenId, arr);
      });

      describe('EIP-165 support', async function () {
        it('supports ERC165', async function () {
          expect(await this.erc1155delta.supportsInterface('0x01ffc9a7')).to.eq(true);
        });

        it('supports IER1155', async function () {
          expect(await this.erc1155delta.supportsInterface('0xd9b67a26')).to.eq(true);
        });

        it('supports ERC1155Metadata_URI', async function () {
          expect(await this.erc1155delta.supportsInterface('0x0e89341c')).to.eq(true);
        });

        it('does not support ERC721', async function () {
          expect(await this.erc1155delta.supportsInterface('0x80ac58cd')).to.eq(false);
        });

        it('does not support random interface', async function () {
          expect(await this.erc1155delta.supportsInterface('0x00000042')).to.eq(false);
        });
      });


      context('with no minted tokens', async function () {
        it('has 0 totalMinted', async function () {
          const totalMinted = await this.erc1155delta.totalMinted();
          expect(totalMinted).to.equal(0);
        });

        it('_nextTokenId must be equal to _startTokenId', async function () {
          const nextTokenId = await this.erc1155delta.nextTokenId();
          expect(nextTokenId).to.equal(offsetted(0));
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
          this.expectedMintCount = 6;

          this.addr1.expected = {
            mintCount: 1,
            tokens: [offsetted(0)],
          };

          this.addr2.expected = {
            mintCount: 2,
            tokens: offsetted(1, 2),
          };

          this.addr3.expected = {
            mintCount: 3,
            tokens: offsetted(3, 4, 5),
          };

          await this.erc1155delta['mint(address,uint256)'](addr1.address, this.addr1.expected.mintCount);
          await this.erc1155delta['mint(address,uint256)'](addr2.address, this.addr2.expected.mintCount);
          await this.erc1155delta['mint(address,uint256)'](addr3.address, this.addr3.expected.mintCount);
        });

        describe('tokenURI (ERC721Metadata)', async function () {
          describe('tokenURI', async function () {
            it('sends an empty uri by default', async function () {
              expect(await this.erc1155delta.uri(offsetted(0))).to.eq('');
            });
          });
        });

        
        describe('balanceOf', async function () {
            /**
          it('returns the amount for a given address', async function () {
            expect(await this.erc1155delta.balanceOf(this.owner.address)).to.equal('0');
            expect(await this.erc1155delta.balanceOf(this.addr1.address)).to.equal(this.addr1.expected.mintCount);
            expect(await this.erc1155delta.balanceOf(this.addr2.address)).to.equal(this.addr2.expected.mintCount);
            expect(await this.erc1155delta.balanceOf(this.addr3.address)).to.equal(this.addr3.expected.mintCount);
          });

          it('returns correct amount with transferred tokens', async function () {
            const tokenIdToTransfer = this.addr2.expected.tokens[0];
            await this.erc1155delta
              .connect(this.addr2)
              .transferFrom(this.addr2.address, this.addr3.address, tokenIdToTransfer);
            // sanity check
            expect(await this.erc1155delta.ownerOf(tokenIdToTransfer)).to.equal(this.addr3.address);

            expect(await this.erc1155delta.balanceOf(this.addr2.address)).to.equal(this.addr2.expected.mintCount - 1);
            expect(await this.erc1155delta.balanceOf(this.addr3.address)).to.equal(this.addr3.expected.mintCount + 1);
          }); */

          it('throws an exception for the 0 address', async function () {
            await expect(this.erc1155delta.balanceOf(ZERO_ADDRESS, "0")).to.be.revertedWith('BalanceQueryForZeroAddress');
            await expect(this.erc1155delta.balanceOf(ZERO_ADDRESS, "1")).to.be.revertedWith('BalanceQueryForZeroAddress');
          });
        }); 

        context('_totalMinted', async function () {
          it('has correct totalMinted', async function () {
            const totalMinted = await this.erc1155delta.totalMinted();
            expect(totalMinted).to.equal(this.expectedMintCount);
          });
        });

        context('_nextTokenId', async function () {
          it('has correct nextTokenId', async function () {
            const nextTokenId = await this.erc1155delta.nextTokenId();
            expect(nextTokenId).to.equal(offsetted(this.expectedMintCount));
          });
        });


        describe('isOwnerOf', async function () {
          it('Check the ownership correctly', async function () {
            for (const minter of [this.addr1, this.addr2, this.addr3]) {
              for (const tokenId of minter.expected.tokens) {
                expect(await this.erc1155delta.isOwnerOf(minter.address, tokenId)).to.be.true;  
              }
            }
          });

          it('Return false for the worng owner', async function () {
            for (const minter of [this.addr2, this.addr3]) {
              for (const tokenId of minter.expected.tokens) {
                expect(await this.erc1155delta.isOwnerOf(this.addr1.address, tokenId)).to.be.false;  
              }
            }
          });
        });


        describe('setApprovalForAll', async function () {
          it('sets approval for all properly', async function () {
            const approvalTx = await this.erc1155delta.setApprovalForAll(this.addr1.address, true);
            await expect(approvalTx)
              .to.emit(this.erc1155delta, 'ApprovalForAll')
              .withArgs(this.owner.address, this.addr1.address, true);
            expect(await this.erc1155delta.isApprovedForAll(this.owner.address, this.addr1.address)).to.be.true;
          });

          it('operator cannot be the caller', async function () {
            expect(
              await this.erc1155delta.connect(this.addr1).isApprovedForAll(this.addr1.address, this.addr1.address)
            ).to.be.false;
            await expect(
              this.erc1155delta.connect(this.addr1).setApprovalForAll(this.addr1.address, true)
            ).to.be.reverted;
          });
        });

        context('test transfer functionality', function () {
          const testSuccessfulTransferSingle = function (transferToContract = true) {
            beforeEach(async function () {
              const sender = this.addr2;
              this.tokenId = this.addr2.expected.tokens[0];
              this.from = sender.address;
              this.to = transferToContract ? this.receiver : this.addr4;
              await this.erc1155delta.connect(sender).setApprovalForAll(this.to.address, true);

              // prettier-ignore
              this.transferTx = await this.erc1155delta
                .connect(sender).safeTransferFrom(this.from, this.to.address, this.tokenId, 1, []);
            });

            it('transfers the ownership of the given token ID to the given address', async function () {
                expect(await this.erc1155delta.isOwnerOf(this.from, this.tokenId)).to.be.false;
                expect(await this.erc1155delta.isOwnerOf(this.to.address, this.tokenId)).to.be.true;
            });

            it('emits a Transfer event', async function () {
              await expect(this.transferTx)
                .to.emit(this.erc1155delta, 'TransferSingle')
                .withArgs(this.addr2.address, this.from, this.to.address, this.tokenId, 1);
            });

            //TODO queryable
            //it('adjusts owners balances', async function () {
            //  expect(await this.erc1155delta.balanceOf(this.from)).to.be.equal(1);
            //});
          };

          const testUnsuccessfulTransferSingle = function () {
            beforeEach(function () {
              this.tokenId = this.addr2.expected.tokens[0];
              this.sender = this.addr1;
            });

            it('rejects unapproved transfer', async function () {
              await expect(
                this.erc1155delta.connect(this.sender).safeTransferFrom(this.addr2.address, this.sender.address, this.tokenId, 1, [])
              ).to.be.revertedWith('TransferCallerNotOwnerNorApproved');
            });

            it('rejects transfer from incorrect owner', async function () {
              // The behavior here is different from ERC721. ERC1155 check if the `from` address approves the operator.
              // On the other hand, ERC721 check if the owner of a token approves the operator.
              await this.erc1155delta.connect(this.addr3).setApprovalForAll(this.sender.address, true);
              await expect(
                this.erc1155delta.connect(this.sender).safeTransferFrom(this.addr3.address, this.sender.address, this.tokenId, 1, [])
              ).to.be.revertedWith('TransferFromIncorrectOwnerOrInvalidAmount');
            });

            it('rejects transfer to zero address', async function () {
              await this.erc1155delta.connect(this.addr2).setApprovalForAll(this.sender.address, true);
              await expect(
                this.erc1155delta.connect(this.sender).safeTransferFrom(this.addr2.address, ZERO_ADDRESS, this.tokenId, 1, [])
              ).to.be.revertedWith('TransferToZeroAddress');
            });
          };

          context('successful transfers', function () {
            context('safeTransferFrom', function () {
              describe('to contract', function () {
                testSuccessfulTransferSingle();

                it('validates ERC1155Received', async function () {
                  await expect(this.transferTx)
                    .to.emit(this.receiver, 'Received')
                    .withArgs(this.addr2.address, this.addr2.address, this.tokenId, '0x', GAS_MAGIC_VALUE);
                });
              });

              describe('to EOA', function () {
                testSuccessfulTransferSingle('safeTransferFrom(address,address,uint256)', false);
              });
            });
          });

          context('unsuccessful transfers', function () {

            describe('safeTransferFrom', function () {
                testUnsuccessfulTransferSingle();

              it('reverts for non-receivers', async function () {
                const nonReceiver = this.erc1155delta;
                // prettier-ignore
                await expect(
                  this.erc1155delta.connect(this.addr1)['safeTransferFrom(address,address,uint256,uint256,bytes)'](
                      this.addr1.address,
                      nonReceiver.address,
                      offsetted(0),
                      1,
                      []
                    )
                ).to.be.revertedWith('TransferToNonERC1155ReceiverImplementer');
              });

              it('reverts when the receiver reverted', async function () {
                // prettier-ignore
                await expect(
                  this.erc1155delta.connect(this.addr1)['safeTransferFrom(address,address,uint256,uint256,bytes)'](
                      this.addr1.address,
                      this.receiver.address,
                      offsetted(0),
                      1,
                      '0x01'
                    )
                ).to.be.revertedWith('reverted in the receiver contract!');
              });

              it('reverts if the receiver returns the wrong value', async function () {
                // prettier-ignore
                await expect(
                  this.erc1155delta.connect(this.addr1)['safeTransferFrom(address,address,uint256,uint256,bytes)'](
                      this.addr1.address,
                      this.receiver.address,
                      offsetted(0),
                      1,
                      '0x02'
                    )
                ).to.be.revertedWith('TransferToNonERC1155ReceiverImplementer');
              });
            });
          });
        });

        describe('_burn', async function () {
          beforeEach(function () {
            this.tokenIdToBurn = offsetted(0);
          });

          //TODO check event

          it('revert if the token to burn is not owned by an owner', async function () {
            expect(await this.erc1155delta.isOwnerOf(this.addr2.address, this.tokenIdToBurn)).to.be.false;
            await expect(
              this.erc1155delta.connect(this.addr2).burn(this.addr2.address, this.tokenIdToBurn)
            ).to.be.revertedWith("TransferCallerNotOwnerNorApproved");
          });


          it('burn a token from an owner', async function () {
            expect(await this.erc1155delta.isOwnerOf(this.addr1.address, this.tokenIdToBurn)).to.be.true;
            await this.erc1155delta.connect(this.addr2).burn(this.addr1.address, this.tokenIdToBurn);
            expect(await this.erc1155delta.isOwnerOf(this.addr1.address, this.tokenIdToBurn)).to.be.false;
          });
        });

      });

      context('test mint functionality', function () {
        beforeEach(async function () {
          const [owner, addr1] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
        });

        const testSuccessfulMint = function (quantity, mintForContract = true) {
          beforeEach(async function () {
            this.minter = mintForContract ? this.receiver : this.addr1;

            //TODO externsion
            //this.balanceBefore = (await this.erc1155delta.balanceOf(this.minter.address)).toNumber();

            this.mintTx = await this.erc1155delta["mint(address,uint256)"](this.minter.address, quantity);
            this.accountArray = [];
            this.idArray = [];
            this.amountArray = [];

            for (let tokenId = offsetted(0); tokenId < offsetted(quantity); tokenId++) {
                this.accountArray.push(this.minter.address);
                this.idArray.push(tokenId);
                this.amountArray.push(1);
            }
        
        });

          it('changes ownership', async function () {
            for (let tokenId = offsetted(0); tokenId < offsetted(quantity); tokenId++) {
              expect(await this.erc1155delta.isOwnerOf(this.minter.address,tokenId)).to.be.true;
            }
          });

          it('emits a Transfer event', async function () {

            for (let tokenId = offsetted(0); tokenId < offsetted(quantity); tokenId++) {
              await expect(this.mintTx)
                .to.emit(this.erc1155delta, 'TransferBatch')
                .withArgs(this.owner.address, ZERO_ADDRESS, this.minter.address, this.idArray, this.amountArray);
            }
          });

          it('adjusts owners balances', async function () {
            const balanceArray = await this.erc1155delta.balanceOfBatch(
                this.accountArray, this.idArray)

            for (let tokenId = offsetted(0); tokenId < offsetted(quantity); tokenId++) {
                expect(balanceArray[tokenId -  offsetted(0)]).to.equal("1");
                expect(
                    await this.erc1155delta.balanceOf(this.minter.address, tokenId)
                ).to.equal(1);
            } 

            //TODO extension
            //expect(await this.erc1155delta.balanceOf(this.minter.address)).to.be.equal(this.balanceBefore + quantity);
          });


          if (mintForContract) {
            it('validates ERC1155Received', async function () {
              for (let tokenId = offsetted(0); tokenId < offsetted(quantity); tokenId++) {
                await expect(this.mintTx)
                  .to.emit(this.minter, 'ReceivedBatch')
                  .withArgs(this.owner.address, ZERO_ADDRESS, this.idArray, '0x', GAS_MAGIC_VALUE);
              }
            });
          }
        };

        const testUnsuccessfulMint = function () {

          it('rejects mints to the zero address', async function () {
            await expect(this.erc1155delta.functions["mint(address,uint256)"](ZERO_ADDRESS, 1)).to.be.revertedWith('MintToZeroAddress');
          });

          it('requires quantity to be greater than 0', async function () {
            await expect(this.erc1155delta.functions["mint(address,uint256)"](this.owner.address, 0)).to.be.revertedWith('MintZeroQuantity');
          });
        };

        context('successful mints', function () {
          

          context('mint', function () {
            context('for contract', function () {
              describe('single token', function () {
                testSuccessfulMint(1);
              });

              describe('multiple tokens', function () {
                testSuccessfulMint(5);
              });

              it('validates ERC721Received with custom _data', async function () {
                const customData = ethers.utils.formatBytes32String('custom data');
                const tx = await this.erc1155delta.functions["mint(address,uint256,bytes)"](this.receiver.address, 1, customData);
                await expect(tx)
                  .to.emit(this.receiver, 'ReceivedBatch')
                  .withArgs(this.owner.address, ZERO_ADDRESS, [offsetted(0)], customData, GAS_MAGIC_VALUE);
              });
            });

            context('for EOA', function () {
              describe('single token', function () {
                testSuccessfulMint(1, false);
              });

              describe('multiple tokens', function () {
                testSuccessfulMint(5, false);
              });
            });
          });
        });

        context('unsuccessful mints', function () {


          context('mint', function () {
            testUnsuccessfulMint();

            it('reverts for non-receivers', async function () {
              const nonReceiver = this.erc1155delta;
              await expect(this.erc1155delta.functions['mint(address,uint256)'](nonReceiver.address, 1)).to.be.reverted;//revertedWith(
              //  'TransferToNonERC721ReceiverImplementer'
              //);
            });

            it('reverts when the receiver reverted', async function () {
              await expect(
                this.erc1155delta.functions['mint(address,uint256,bytes)'](this.receiver.address, 1, '0x01')
              ).to.be.revertedWith('reverted in the receiver contract!');
            });

            it('reverts if the receiver returns the wrong value', async function () {
              await expect(
                this.erc1155delta.functions['mint(address,uint256,bytes)'](this.receiver.address, 1, '0x02')
              ).to.be.reverted;//revertedWith('TransferToNonERC721ReceiverImplementer');
            });

            //TODO if reentrancy does no harm to the contract states, should we implement the guard?
            //it('reverts with reentrant call', async function () {
            //  await expect(
            //    this.erc1155delta.functions['mint(address,uint256,bytes)'](this.receiver.address, 1, '0x03')
            //  ).to.be.reverted;
            //});
          });
        });
      });

    });
  };

describe('ERC1155DeltaMock', createTestSuite({ contract: 'ERC1155DeltaMock', constructorArgs: [""] }));
/**
describe(
  'ERC721A override _startTokenId()',
  createTestSuite({ contract: 'ERC721AStartTokenIdMock', constructorArgs: ['Azuki', 'AZUKI', 1] })
);

describe('ERC721A with ERC2309', async function () {
  beforeEach(async function () {
    const [owner, addr1] = await ethers.getSigners();
    this.owner = owner;
    this.addr1 = addr1;

    let args;
    args = ['Azuki', 'AZUKI', this.owner.address, 1, true];
    this.erc1155deltaMint1 = await deployContract('ERC721AWithERC2309Mock', args);
    args = ['Azuki', 'AZUKI', this.owner.address, 10, true];
    this.erc1155deltaMint10 = await deployContract('ERC721AWithERC2309Mock', args);
  });

  it('emits a ConsecutiveTransfer event for single mint', async function () {    
    expect(this.erc1155deltaMint1.deployTransaction)
      .to.emit(this.erc1155deltaMint1, 'ConsecutiveTransfer')
      .withArgs(0, 0, ZERO_ADDRESS, this.owner.address);
  });

  it('emits a ConsecutiveTransfer event for a batch mint', async function () {    
    expect(this.erc1155deltaMint10.deployTransaction)
      .to.emit(this.erc1155deltaMint10, 'ConsecutiveTransfer')
      .withArgs(0, 9, ZERO_ADDRESS, this.owner.address);
  });

  it('requires quantity to be below mint limit', async function () {
    let args;
    const mintLimit = 5000;
    args = ['Azuki', 'AZUKI', this.owner.address, mintLimit, true];
    await deployContract('ERC721AWithERC2309Mock', args);
    args = ['Azuki', 'AZUKI', this.owner.address, mintLimit + 1, true];
    await expect(deployContract('ERC721AWithERC2309Mock', args)).to.be.revertedWith('MintERC2309QuantityExceedsLimit');
  })

  it('rejects mints to the zero address', async function () {
    let args = ['Azuki', 'AZUKI', ZERO_ADDRESS, 1, true];
    await expect(deployContract('ERC721AWithERC2309Mock', args)).to.be.revertedWith('MintToZeroAddress');
  });

  it('requires quantity to be greater than 0', async function () {
    let args = ['Azuki', 'AZUKI', this.owner.address, 0, true];
    await expect(deployContract('ERC721AWithERC2309Mock', args)).to.be.revertedWith('MintZeroQuantity');
  });
}); */