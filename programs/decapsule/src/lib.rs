use anchor_lang::prelude::*;

declare_id!("4vYgtqYrVNfRX8nXePm8XjUhaCuWpqmC2c2HJtU5LVff");

#[program]
pub mod decapsule {
    use super::*;

    pub fn bury_time_capsule(
        ctx: Context<BuryTimeCapsule>,
        nfts: String,
        owner: Pubkey,
        capsule: Pubkey,
        bury_time: u8,
        seal_duration: u8,
        location: String,
    ) -> Result<()> {
        let time_capsule = &mut ctx.accounts.time_capsule;
        time_capsule.nfts = nfts;
        time_capsule.owner = owner;
        time_capsule.capsule = capsule;
        time_capsule.bury_time = bury_time;
        time_capsule.seal_duration = seal_duration;
        time_capsule.location = location;

        Ok(())
    }

    pub fn bury_nft(
        ctx: Context<BuryNFT>,
        _nft: String,
        bury_time: u8,
        location: String,
    ) -> Result<()> {
        let buried_nft = &mut ctx.accounts.buried_nft;
        buried_nft.bury_time = bury_time;
        buried_nft.location = location;

        Ok(())
    }

    pub fn close(_ctx: Context<Close>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(nfts: String, capsule: Pubkey,bury_time: u8,seal_duration: u8,location: String)]
pub struct BuryTimeCapsule<'info> {
    #[account(
        init,
        seeds = ["capsule".as_bytes(), capsule.key().as_ref()],
        bump,
        payer = initializer,
        space = 8 + 32 + 32 + 4 + 8
    )]
    pub time_capsule: Account<'info, TimeCapsule>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(nft: Pubkey,bury_time: u8, location: String,)]
pub struct BuryNFT<'info> {
    #[account(
        init,
        seeds = ["buried_nft".as_bytes(), nft.key().as_ref() ],
        bump,
        payer = initializer,
        space = 8 + 32 + 32 + 4 + 8
    )]
    pub buried_nft: Account<'info, NftState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut, close = owner)]
    time_capsule: Account<'info, TimeCapsule>,
    #[account(mut)]
    owner: Signer<'info>,
}

#[account]
pub struct TimeCapsule {
    nfts: String,
    capsule: Pubkey,
    owner: Pubkey,
    bury_time: u8,
    seal_duration: u8,
    location: String,
}

#[account]
pub struct NftState {
    nft: Pubkey,
    bury_time: u8,
    location: String,
}
