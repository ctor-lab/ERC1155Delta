const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const ERC1155Mock = artifacts.require('ERC1155DeltaMock');

contract('ERC1155', function (accounts) {
  const [operator, tokenHolder, tokenBatchHolder, ...otherAccounts] = accounts;

  const initialURI = 'https://token-cdn-domain/{id}.json';

  beforeEach(async function () {
    this.token = await ERC1155Mock.new(initialURI);
  });

  //shouldBehaveLikeERC1155(otherAccounts);

  describe('internal functions', function () {

    const mintAmount = new BN(500);
    let tokenIds = [];
    let amounts = [];

    for(let i = 0; i < 5; i++) {
        tokenIds.push(new BN(i.toString()));
        amounts.push(new BN("1"));
    }
    

    const data = '0x12345678';

    describe('_mint', function () {
      it('reverts with a zero destination address', async function () {
        await expectRevert(
          this.token.mint(ZERO_ADDRESS, mintAmount, data),
          'ERC1155: mint to the zero address',
        );
      });

      context('with minted tokens', function () {
        beforeEach(async function () {
          (this.receipt = await this.token.mint(tokenHolder, mintAmount, data, { from: operator }));
          console.log(await this.token.mint(operator, 1, [], { from: operator }));

        });

        it('emits a TransferBatch event', function () {

          expectEvent(this.receipt, 'TransferBatch', {
            operator,
            from: ZERO_ADDRESS,
            to: tokenHolder,
            //ids: tokenIds,
            //value: amounts,
          });
        });

        it('credits the minted amount of tokens', async function () {
          expect(await this.token.balanceOf(tokenHolder, 0)).to.be.bignumber.equal(new BN(1));
          expect(await this.token.balanceOf(tokenHolder, 1)).to.be.bignumber.equal(new BN(1));
          expect(await this.token.balanceOf(tokenHolder, 499)).to.be.bignumber.equal(new BN(1));
          expect(await this.token.balanceOf(tokenHolder, 500)).to.be.bignumber.equal(new BN(0));
        });
      });
    });

    describe('_burn', function () {
        const tokenId = new BN(300);
      it('reverts when burning the zero account\'s tokens', async function () {
        await expectRevert(
          this.token.burn(ZERO_ADDRESS, tokenId),
          'ERC1155: burn from the zero address',
        );
      });

      it('reverts when burning a non-existent token id', async function () {
        await expectRevert(
          this.token.burn(tokenHolder, tokenId),
          'ERC1155: burn amount exceeds balance',
        );
      });

      context('with minted-then-burnt tokens', function () {
        beforeEach(async function () {
          await this.token.mint(tokenHolder, mintAmount, data);
          (this.receipt = await this.token.burn(
            tokenHolder,
            tokenId,
            { from: operator },
          ));
        });

        it('emits a TransferSingle event', function () {
          expectEvent(this.receipt, 'TransferSingle', {
            operator,
            from: tokenHolder,
            to: ZERO_ADDRESS,
            id: tokenId,
            value: new BN(1),
          });
        });
      });
    });

  });

  describe('ERC1155MetadataURI', function () {
    const firstTokenID = new BN('42');
    const secondTokenID = new BN('1337');

    it('emits no URI event in constructor', async function () {
      await expectEvent.notEmitted.inConstruction(this.token, 'URI');
    });

    it('sets the initial URI for all token types', async function () {
      expect(await this.token.uri(firstTokenID)).to.be.equal(initialURI);
      expect(await this.token.uri(secondTokenID)).to.be.equal(initialURI);
    });

    describe('_setURI', function () {
      const newURI = 'https://token-cdn-domain/{locale}/{id}.json';

      it('emits no URI event', async function () {
        const receipt = await this.token.setURI(newURI);

        expectEvent.notEmitted(receipt, 'URI');
      });

      it('sets the new URI for all token types', async function () {
        await this.token.setURI(newURI);

        expect(await this.token.uri(firstTokenID)).to.be.equal(newURI);
        expect(await this.token.uri(secondTokenID)).to.be.equal(newURI);
      });
    });
  });
});