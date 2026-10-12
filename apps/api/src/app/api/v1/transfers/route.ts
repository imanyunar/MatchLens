import { getFootballProvider } from '@/lib/football/adapter';
import { apiError, apiSuccess } from '@/lib/response';


export async function GET() {
  try {
    const provider = getFootballProvider();
    const transfers = await provider.getTransferReports();

    return apiSuccess(transfers, { total: transfers.length });
  } catch (error) {
    console.error('[API] /transfers error:', error);
    return apiError(
      error instanceof Error ? error.message : 'Failed to retrieve transfers',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
