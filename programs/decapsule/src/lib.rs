use anchor_lang::prelude::*;

declare_id!("6dJGf3EYNT3g8Qj9vXTxdVjzTGCs9udYu4cTRCEMGL9J");

#[program]
pub mod decapsule {
    use super::*;

    #[inline(never)]
    pub fn bury_time_capsule(
        ctx: Context<BuryTimeCapsule>,
        nfts: Vec<Pubkey>,
        capsule: Pubkey,
        bury_time: String,
        seal_duration: String,
        location: String,
    ) -> Result<()> {
        let buried_time_capsule = &mut ctx.accounts.buried_time_capsule;
        buried_time_capsule.nfts = nfts;
        buried_time_capsule.capsule = capsule;
        buried_time_capsule.bury_time = bury_time;
        buried_time_capsule.seal_duration = seal_duration;
        buried_time_capsule.location = location;
       
        Ok(())
    }

    #[inline(never)]
    pub fn bury_nft(
        ctx: Context<BuryNFT>,
        nft: Pubkey,
        bury_time: String,
        seal_duration: String,
        location: String,
    ) -> Result<()> {
        let buried_nft = &mut ctx.accounts.buried_nft;
        buried_nft.nft = nft;
        buried_nft.bury_time = bury_time;
        buried_nft.seal_duration = seal_duration;
        buried_nft.location = location;
        Ok(())
    }

    pub fn close(_ctx: Context<Close>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(nfts: Vec<Pubkey>, capsule: Pubkey, bury_time: String, seal_duration: String, location: String)]
pub struct BuryTimeCapsule<'info> {
    #[account(
        init,
        seeds = [capsule.key().as_ref()],
        bump,
        payer = initializer,
        space = 1024
    )]
    pub buried_time_capsule: Account<'info, TimeCapsule>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(nft:Pubkey ,bury_time: String, seal_duration: String, location: String,)]
pub struct BuryNFT<'info> {
    #[account(
        init,
        seeds = [nft.key().as_ref()],
        bump,
        payer = initializer,
        space = 1024
    )]
    pub buried_nft: Account<'info, NftState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut, close = initializer)]
    buried_time_capsule: Account<'info, TimeCapsule>,
    #[account(mut)]
    pub initializer: Signer<'info>,
}

#[account]
pub struct TimeCapsule {
    nfts: Vec<Pubkey>,
    capsule: Pubkey,
    bury_time: String,
    seal_duration: String,
    location: String,
}

#[account]
pub struct NftState {
    nft: Pubkey,
    bury_time: String,
    seal_duration: String,
    location: String,
}
